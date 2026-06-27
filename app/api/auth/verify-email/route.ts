import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per 60 seconds per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`verify-email:${ip}`, AUTH_RATE_LIMITS.verifyEmail)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rateLimitResult.resetIn} seconds.` },
        { status: 429 }
      )
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Mark email as verified
    user.emailVerified = true
    user.verificationToken = null
    user.verificationTokenExpiry = null
    await user.save()

    return NextResponse.json(
      { message: "Email verified successfully! You can now sign in." },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
