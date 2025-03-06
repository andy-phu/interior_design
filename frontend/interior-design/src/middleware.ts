import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    console.log("Middleware activated");
    return await updateSession(request)
}

export const config = {
  matcher: [
    "/", "/profile/:path*", "/tester/:path*", "/product/:path*",
  ],
}