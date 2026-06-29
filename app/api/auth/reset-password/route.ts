import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per 5 minutes per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`reset-password:${ip}`, AUTH_RATE_LIMITS.resetPassword)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${rateLimitResult.resetIn} seconds.` },
        { status: 429 }
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Hash new password and clear reset token
    const hashedPassword = await bcrypt.hash(password, 12)
    user.password = hashedPassword
    user.resetPasswordToken = null
    user.resetPasswordTokenExpiry = null
    await user.save()

    return NextResponse.json(
      { message: "Password reset successfully!" },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
