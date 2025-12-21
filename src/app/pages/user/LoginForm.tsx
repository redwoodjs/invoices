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

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setResult("");

    const [valid, error] = await validateEmailAddress(email);
    if (!valid) {
      setResult(error as string);
      setIsLoading(false);
      return;
    }

    try {
      const options = await startPasskeyRegistration(email);
      const registration = await startRegistration({
        optionsJSON: options,
      });

      const success = await finishPasskeyRegistration(email, registration);

      if (success) {
        window.location.href = "/invoice/list";
      } else {
        setResult("Failed to register");
        setIsLoading(false);
      }
    } catch (err) {
      setResult("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setResult("");

    try {
      const options = await startPasskeyLogin();
      const authentication = await startAuthentication({
        optionsJSON: options,
      });

      const success = await finishPasskeyLogin(authentication);

      if (success) {
        window.location.href = "/invoice/list";
      } else {
        setResult("Failed to login");
        setIsLoading(false);
      }
    } catch (err) {
      setResult("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const isError =
    result &&
    (result.includes("Failed") ||
      result.includes("Invalid") ||
      result.includes("failed"));

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6 shadow-lg transition-shadow duration-200 hover:shadow-xl sm:p-8">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground transition-colors"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleLogin();
                }
              }}
            />
          </div>

          {/* Error/Success Message */}
          {result && (
            <div
              className={`rounded-md border p-3 text-sm transition-all duration-200 ${
                isError
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-primary/50 bg-primary/10 text-primary"
              }`}
              role="alert"
            >
              {result}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading || !email.trim()}
              className="w-full transition-all duration-200"
              size="lg"
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
            <Button
              onClick={handleRegister}
              disabled={isLoading || !email.trim()}
              variant="outline"
              className="w-full transition-all duration-200"
              size="lg"
            >
              {isLoading ? "Registering..." : "Create account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
