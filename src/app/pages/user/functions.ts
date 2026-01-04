"use server";

import { env } from "cloudflare:workers";

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

import { sessionStore } from "@/worker";
import { requestInfo } from "rwsdk/worker";
import { db } from "@/db/db";

const IS_DEV = process.env.NODE_ENV === "development";

export async function validateEmailAddress(email: string) {
  const user = await db
    .selectFrom("User")
    .select(["id"])
    .where("email", "=", email)
    .executeTakeFirst();
  if (user) {
    return [false, "Email address already exists"];
  } else {
    return [true, ""];
  }
}

function getWebAuthnConfig(request: Request) {
  const rpID = env.WEBAUTHN_RP_ID ?? new URL(request.url).hostname;
  const rpName = IS_DEV ? "Development App" : env.WEBAUTHN_APP_NAME;
  return {
    rpName,
    rpID,
  };
}

export async function startPasskeyRegistration(username: string) {
  const { rpName, rpID } = getWebAuthnConfig(requestInfo.request);
  const { headers } = requestInfo.response;

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    authenticatorSelection: {
      // Require the authenticator to store the credential, enabling a username-less login experience
      residentKey: "required",
      // Prefer user verification (biometric, PIN, etc.), but allow authentication even if it's not available
      userVerification: "preferred",
    },
  });

  await sessionStore.save(headers, { challenge: options.challenge });

  return options;
}

export async function startPasskeyLogin() {
  const { rpID } = getWebAuthnConfig(requestInfo.request);
  const { headers } = requestInfo.response;

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: [],
  });

  await sessionStore.save(headers, { challenge: options.challenge });

  return options;
}

export async function finishPasskeyRegistration(
  email: string,
  registration: RegistrationResponseJSON
) {
  const { request } = requestInfo;
  const { headers } = requestInfo.response;
  const { origin } = new URL(request.url);

  const session = await sessionStore.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const verification = await verifyRegistrationResponse({
    response: registration,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return false;
  }

  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .insertInto("User")
    .values({
      id: userId,
      email,
      createdAt: now,
    })
    .execute();

  await db
    .insertInto("Credential")
    .values({
      id: crypto.randomUUID(),
      userId,
      credentialId: verification.registrationInfo.credential.id,
      publicKey: verification.registrationInfo.credential.publicKey,
      counter: verification.registrationInfo.credential.counter,
      createdAt: now,
    })
    .execute();

  await sessionStore.save(headers, {
    userId,
    challenge: null,
  });

  return true;
}

export async function finishPasskeyLogin(login: AuthenticationResponseJSON) {
  const { request } = requestInfo;
  const { headers } = requestInfo.response;
  const { origin } = new URL(request.url);

  const session = await sessionStore.load(request);
  const challenge = session?.challenge;

  if (!challenge) {
    return false;
  }

  const credential = await db
    .selectFrom("Credential")
    .selectAll()
    .where("credentialId", "=", login.id)
    .executeTakeFirst();

  if (!credential) {
    return false;
  }

  const verification = await verifyAuthenticationResponse({
    response: login,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: env.WEBAUTHN_RP_ID || new URL(request.url).hostname,
    requireUserVerification: false,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
    },
  });

  if (!verification.verified) {
    return false;
  }

  await db
    .updateTable("Credential")
    .set({ counter: verification.authenticationInfo.newCounter })
    .where("credentialId", "=", login.id)
    .execute();

  const user = await db
    .selectFrom("User")
    .selectAll()
    .where("id", "=", credential.userId)
    .executeTakeFirst();

  if (!user) {
    return false;
  }

  await sessionStore.save(headers, {
    userId: user.id,
    challenge: null,
  });

  return true;
}
