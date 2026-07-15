"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      setResetToken(result.resetToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll generate a reset token (POC mode)">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {resetToken ? (
          <Alert variant="success">
            <p className="font-medium">Reset token generated</p>
            <p className="mt-2 break-all text-xs">{resetToken}</p>
            <p className="mt-3">
              <Link href={`/reset-password?token=${resetToken}`} className="text-violet-600 hover:underline">
                Continue to reset password →
              </Link>
            </p>
          </Alert>
        ) : (
          <>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Get reset token"}
            </Button>
          </>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className="text-violet-600 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
