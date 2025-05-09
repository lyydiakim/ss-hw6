import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get session data directly from Better Auth
  // This is the proper way to access the session in middleware
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check authentication and admin status
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === "admin";

  // Handle /todos route - redirect to sign-in if not authenticated
  if (pathname === "/todos" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Handle /admin route - redirect to home if not authenticated or not admin
  if (pathname === "/admin" && (!isAuthenticated || !isAdmin)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/todos", "/admin"],
};
