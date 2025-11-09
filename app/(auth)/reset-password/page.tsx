"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { handleError, handleSupabaseError, ValidationError } from "@/lib/exceptions"

type ResetPasswordForm = {
  password: string
  confirmPassword: string
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>()

  const password = watch("password")

  useEffect(() => {
    // Check if we have the code parameter
    const code = searchParams.get('code')
    if (!code) {
      toast.error('Invalid reset link')
      router.push('/forgot-password')
    }
  }, [searchParams, router])

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true)

      // Validate passwords
      if (!data.password || !data.confirmPassword) {
        throw new ValidationError("All fields are required")
      }

      if (data.password !== data.confirmPassword) {
        throw new ValidationError("Passwords do not match")
      }

      if (data.password.length < 6) {
        throw new ValidationError("Password must be at least 6 characters")
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        const appError = handleSupabaseError(error)
        throw appError
      }

      toast.success("Password reset successfully!")
      router.push("/login")
    } catch (error) {
      handleError(error, "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/login")}
                className="text-muted-foreground"
              >
                Back to login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
