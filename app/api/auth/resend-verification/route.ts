import { NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { sendVerificationEmail } from "@/lib/mail"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limit: 2 attempts per 60 seconds per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`resend-verification:${ip}`, AUTH_RATE_LIMITS.resendVerification)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.` },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an unverified account exists with this email, a new verification link has been sent." },
        { status: 200 }
      )
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "If an unverified account exists with this email, a new verification link has been sent." },
        { status: 200 }
      )
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.verificationToken = verificationToken
    user.verificationTokenExpiry = verificationTokenExpiry
    await user.save()

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      { message: "If an unverified account exists with this email, a new verification link has been sent." },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
