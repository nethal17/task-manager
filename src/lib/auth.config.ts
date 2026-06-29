import type { NextAuthConfig } from "next-auth"

/**
 * Auth config shared between middleware (Edge) and server (Node.js).
 * This file must NOT import mongoose or any Node.js-only modules.
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (Node.js only)
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const protectedRoutes = ["/dashboard"]
      const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"]

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      )
      const isAuthRoute = authRoutes.some((route) =>
        pathname.startsWith(route)
      )

      // Redirect to login if accessing protected route without auth
      if (isProtectedRoute && !isLoggedIn) {
        return false
      }

      // Redirect to dashboard if accessing auth routes while authenticated
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
  },
}
