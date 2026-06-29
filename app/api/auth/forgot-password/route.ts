import { NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { sendPasswordResetEmail } from "@/lib/mail"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limit: 3 attempts per 5 minutes per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`forgot-password:${ip}`, AUTH_RATE_LIMITS.forgotPassword)

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
        { message: "If an account exists with this email, you will receive a reset link." },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordTokenExpiry = resetTokenExpiry
    await user.save()

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a reset link." },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
