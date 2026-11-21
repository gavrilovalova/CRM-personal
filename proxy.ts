import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next();
    }
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
  // /health stays open: the deploy smoke check calls it without credentials
  matcher: ["/((?!_next/static|_next/image|favicon.ico|health$).*)"],
};
