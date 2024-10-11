import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

console.log(matchers);

export default clerkMiddleware((auth, req) => {
  // if (isProtectedRoute(req)) auth().protect()

  const { sessionClaims } = auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role!)) {
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
// lib/config.js
export const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnbsiK/mO/a3LUArdVtQK
5jLwqzM7hgnr4csojfoXp371uVEcE9KLo9t1YzD5phAuAyc6BXUr9iWXuTOqxyPS
dQEGvVqGSSZmA1dEVCRNm8zv9EkyUvqtbiFMcvtt0eM3ciKcVph83KsXzVaU6o98
lp/qFZk4C2bR9CzHG73CtQutH35fAatbRtEFiZfedLVnuxm1LqlvP2CnPPgVAwVy
8WAbB4GsBy/Zvjvzm3BvDtUk3qAre14PE6yM7FWsI/9cHOZKrYvQmF29go8FIWiQ
yLGbXTkgQETinoVtBkGIsFacTqMQwEMChrTJER4dPLclJlXjQm6nFeFhFpM1u0EF
EQIDAQAB
-----END PUBLIC KEY-----`;
