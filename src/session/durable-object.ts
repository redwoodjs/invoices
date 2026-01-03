import { MAX_SESSION_DURATION } from "rwsdk/auth";
import { DurableObject } from "cloudflare:workers";

export interface Session {
  userId?: string | null;
  challenge?: string | null;
  createdAt: number;
}

export class SessionDurableObject extends DurableObject {
  private storage: DurableObjectStorage;
  private session: Session | undefined = undefined;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.storage = state.storage;
    this.session = undefined;
  }

  async saveSession(data: Partial<Session>): Promise<Session> {
    const existing =
      this.session ?? (await this.storage.get<Session>("session"));

    const session: Session = {
      userId: data.userId ?? existing?.userId ?? null,
      challenge: data.challenge ?? existing?.challenge ?? null,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    await this.storage.put<Session>("session", session);
    this.session = session;
    return session;
  }

  async getSession(): Promise<{ value: Session }> {
    if (this.session) {
      return { value: this.session };
    }

    const session = await this.storage.get<Session>("session");

    if (!session) {
      return {
        value: { userId: null, challenge: null, createdAt: Date.now() },
      };
    }

    if (session.createdAt + MAX_SESSION_DURATION < Date.now()) {
      await this.revokeSession();
      return {
        value: { userId: null, challenge: null, createdAt: Date.now() },
      };
    }

    this.session = session;
    return { value: session };
  }

  async revokeSession() {
    await this.storage.delete("session");
    this.session = undefined;
  }
}
