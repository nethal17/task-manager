import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold">Task Manager</CardTitle>
          <CardDescription className="text-lg">
            Organize your tasks efficiently and boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground mb-4">
            Get started by signing in to your account or creating a new one
          </p>
          <div className="flex gap-4 w-full max-w-sm">
            <Link href="/login" className="flex-1">
              <Button variant="default" size="lg" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
