import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import Task, { type ITask } from "@/lib/db/models/Task"

// GET all tasks for the authenticated user
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const tasks = await Task.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean<ITask[]>()

    // Transform _id to id for frontend compatibility
    const transformedTasks = tasks.map((task) => ({
      id: String(task._id),
      title: task.title,
      completed: task.completed,
      userId: String(task.userId),
      priority: task.priority,
      deadline_date: task.deadlineDate,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformedTasks)
  } catch (error: unknown) {
    console.error("Get tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST create a new task
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, priority, deadline_date } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      )
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: "Task title is too long (max 255 characters)" },
        { status: 400 }
      )
    }

    await connectDB()

    const task = await Task.create({
      title: title.trim(),
      priority: priority || "Low",
      deadlineDate: deadline_date || null,
      completed: false,
      userId: session.user.id,
    })

    return NextResponse.json(
      {
        id: task._id.toString(),
        title: task.title,
        completed: task.completed,
        userId: task.userId.toString(),
        priority: task.priority,
        deadline_date: task.deadlineDate,
        created_at: task.createdAt.toISOString(),
        updated_at: task.updatedAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Create task error:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
