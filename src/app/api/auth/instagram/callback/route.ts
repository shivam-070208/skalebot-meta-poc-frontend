import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.toString();

  const res = await fetch(
    `${backendUrl}/api/v1/auth/instagram/callback${query ? `?${query}` : ""}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data.message === "string" ? data.message : "Instagram connection failed";
    return NextResponse.redirect(
      `${appUrl}/connect-instagram?error=${encodeURIComponent(message)}`
    );
  }

  const account = data.account;
  if (!account?.id) {
    return NextResponse.redirect(
      `${appUrl}/connect-instagram?error=${encodeURIComponent("Invalid account response")}`
    );
  }

  const params = new URLSearchParams({
    success: "1",
    accountId: account.id,
    username: account.username ?? "",
    instagramAccountId: account.instagramAccountId ?? "",
    profilePicture: account.profilePicture ?? "",
  });

  return NextResponse.redirect(`${appUrl}/connect-instagram?${params.toString()}`);
}
