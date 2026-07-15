import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";
const defaultRedirectUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_OAUTH_REDIRECT_URL ??
  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/connect-instagram?success=1`;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }

  const redirectUrl =
    request.nextUrl.searchParams.get("redirect_url") ?? defaultRedirectUrl;

  const backendUrlWithQuery = new URL(`${backendUrl}/api/v1/auth/instagram`);
  backendUrlWithQuery.searchParams.set("redirect_url", redirectUrl);

  const res = await fetch(backendUrlWithQuery.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "manual",
  });

  const location = res.headers.get("location");
  if (location) {
    const response = NextResponse.redirect(location);

    const setCookies =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : res.headers.get("set-cookie")
          ? [res.headers.get("set-cookie")!]
          : [];

    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  }

  const body = await res.json().catch(() => ({}));
  return NextResponse.json(
    { message: body.message ?? "Failed to start Instagram OAuth" },
    { status: res.status }
  );
}
