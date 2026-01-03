import { type RequestInfo } from "rwsdk/worker";
import { Layout } from "../layout";
import { LoginForm } from "./login-form";

export function LoginPage({ ctx }: RequestInfo) {
  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
}
