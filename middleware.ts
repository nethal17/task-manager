import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

export default async function middleware(request: NextRequest) {
  return (auth as any)(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
