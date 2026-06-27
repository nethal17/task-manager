import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

/**
 * Validates credentials and returns a user-friendly error message.
 * The actual sign-in is still done via NextAuth on the client side,
 * but this endpoint is called first to get proper error messages.
 */
export async function POST(request: Request) {
  try {
    // Rate limit: 5 login attempts per 60 seconds per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`login:${ip}`, AUTH_RATE_LIMITS.login)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimitResult.resetIn} seconds.` },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in. Check your inbox for the verification link.", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Login validation error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
