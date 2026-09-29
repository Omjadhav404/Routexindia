import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not configured, bypass authentication entirely
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  // If it is dashboard and user is unauthenticated, protect the route
  if (isDashboardRoute(req)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
