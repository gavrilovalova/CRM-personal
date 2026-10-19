import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Temporary protection until real sign-in exists: the browser asks for
// a login and password (HTTP Basic Auth) before showing any page.
// Credentials come from BASIC_AUTH_USER and BASIC_AUTH_PASSWORD.
export function proxy(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    // Local development works without a password
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
    // In production never open the app by accident
    return new NextResponse("Basic auth is not configured", { status: 503 });
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (
      separator !== -1 &&
      decoded.slice(0, separator) === user &&
      decoded.slice(separator + 1) === password
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Relma", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
