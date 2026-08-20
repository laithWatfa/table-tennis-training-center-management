
import NextAuth, { NextAuthRequest } from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
// export default NextAuth(authConfig).auth;
const { auth } = NextAuth(authConfig);

export default auth((req : NextAuthRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Evaluates to true if token session cookie is valid
  const userRole =  req.auth?.user?.role; // Extracts role safely

  // console.log("MIDDLEWARE AUTH OBJECT DEBUG:", JSON.stringify(req.auth, null, 2));
  // console.log("EXTRACTED USER ROLE IS:", userRole)


  const isManagerRoute = nextUrl.pathname.startsWith("/manager");
  const isPlayerRoute = nextUrl.pathname.startsWith("/player");
  const isAuthRoute = nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up");

  // 1. IF GUEST TRIES TO ACCESS ANY PROTECTED VIEW: KICK THEM TO LOGIN
  if ((isManagerRoute || isPlayerRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  // 2. ROLE GUARD: REGULAR PLAYER TRIES TO ACCESS THE MANAGER SECTION
  if (isManagerRoute && isLoggedIn && userRole !== "Admin") {
    // Redirect them safely back to their own user ledger panel
    return NextResponse.redirect(new URL("/player/reservations", nextUrl));
  }

  // 3. OPTIONAL GUARD: MANAGER ACCIDENTALLY TRIES TO OPEN REGULAR PLAYER VIEWS
  // if (isPlayerRoute && isLoggedIn && userRole === "Admin") {
  //   return NextResponse.redirect(new URL("/manager/reservations", nextUrl));
  // }

  // 4. PREVENT LOGGED-IN USERS FROM SEEING SIGN-IN / SIGN-UP SCREENS AGAIN
  if (isAuthRoute && isLoggedIn) {
    const redirectUrl = userRole === "Admin" ? "/manager/reservations" : "/player/reservations";
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  return NextResponse.next(); // Proceed normally if no boundaries are crossed
});

// Configure which paths pass through this verification filter
export const config = {
  // Protects everything except API endpoints, static assets, next image optimizations, and favicon files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
