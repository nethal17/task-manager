import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, ListChecks, Zap, Shield, Users } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Create, organize, and track your tasks with ease"
    },
    {
      icon: Calendar,
      title: "Deadline Tracking",
      description: "Never miss a deadline with built-in reminders"
    },
    {
      icon: ListChecks,
      title: "Progress Tracking",
      description: "Separate active and completed tasks for better focus"
    },
    {
      icon: Zap,
      title: "Priority System",
      description: "Organize tasks by priority: Low, Medium, High"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected"
    },
    {
      icon: Users,
      title: "User-Friendly",
      description: "Simple, intuitive interface for everyone"
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto overflow-visible">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent leading-[1.08] md:leading-[1.08] pb-1">
              My Task Manager
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Organize your life, boost productivity, and achieve your goals with our powerful task management system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link href="/signup" className="flex-1">
              <Button size="lg" className="w-full text-lg h-12 cursor-pointer">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" size="lg" className="w-full text-lg h-12 cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 w-full max-w-2xl">
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Free to Use</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-bold text-primary">Secure</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Data Protected</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-bold text-primary">24/7</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Always Available</p>
            </div>
          </div>
        </div>

        <div className="mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-muted-foreground text-lg">
              Powerful features designed to help you manage tasks efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up for free in seconds
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Add Tasks</h3>
              <p className="text-muted-foreground">
                Create tasks with priorities and deadlines
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Stay Organized</h3>
              <p className="text-muted-foreground">
                Track progress and complete your goals
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center">
          <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-12 pb-12 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Organized?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of users who are already managing their tasks efficiently
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-lg h-12 px-8 cursor-pointer">
                  Start Managing Tasks Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>


        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>© 2025 Task Manager. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
