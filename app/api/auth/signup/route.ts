import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { connectDB } from "@/lib/db/mongoose"
import User from "@/lib/db/models/User"
import { sendVerificationEmail } from "@/lib/mail"
import { rateLimit, getClientIp, AUTH_RATE_LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limit: 3 signups per 60 seconds per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(`signup:${ip}`, AUTH_RATE_LIMITS.signup)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: `Too many signup attempts. Please try again in ${rateLimitResult.resetIn} seconds.` },
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    })

    // Send verification email — roll back user creation if this fails
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError: unknown) {
      console.error("Failed to send verification email:", emailError)
      // Delete the user so they can retry signup
      await User.deleteOne({ _id: newUser._id })
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Account created! Please check your email to verify your account." },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
