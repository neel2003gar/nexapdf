import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for static export builds (GitHub Pages)
  if (process.env.GITHUB_ACTIONS) {
    return NextResponse.next()
  }
  
  // Simple middleware - just pass through all requests
  return NextResponse.next()
}

export const config = {
  // Match all pathnames except for static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}