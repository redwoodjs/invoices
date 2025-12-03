"use client";

import { useState } from "react";
import type { RequestInfo } from "rwsdk/worker";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

import {
  startPasskeyRegistration,
  finishPasskeyRegistration,
  startPasskeyLogin,
  finishPasskeyLogin,
  validateEmailAddress,
} from "./functions";
import { link } from "@/app/shared/links";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  return (
    <>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        onClick={async () => {
          const [valid, error] = await validateEmailAddress(email);
          if (!valid) {
            setResult(error as string);
            return;
          }

          const options = await startPasskeyRegistration(email);
          const registration = await startRegistration({
            optionsJSON: options,
          });

          const success = await finishPasskeyRegistration(email, registration);

          if (success) {
            window.location.href = link("/invoice/list");
          } else {
            setResult("Failed to register");
          }
        }}
      >
        Register
      </Button>
      <Button
        onClick={async () => {
          const options = await startPasskeyLogin();
          const authentication = await startAuthentication({
            optionsJSON: options,
          });

          const success = await finishPasskeyLogin(authentication);

          if (success) {
            window.location.href = link("/invoice/list");
          } else {
            setResult("Failed to login");
          }
        }}
      >
        Login
      </Button>
      <div>{result}</div>
    </>
  );
}
