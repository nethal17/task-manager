import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectDB } from "@/lib/db/mongoose"
import Task from "@/lib/db/models/Task"

// PATCH update a task
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    await connectDB()

    const task = await Task.findOne({ _id: id, userId: session.user.id })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Update allowed fields
    if (body.title !== undefined) {
      if (body.title.trim().length === 0) {
        return NextResponse.json(
          { error: "Task title is required" },
          { status: 400 }
        )
      }
      if (body.title.length > 255) {
        return NextResponse.json(
          { error: "Task title is too long (max 255 characters)" },
          { status: 400 }
        )
      }
      task.title = body.title.trim()
    }

    if (body.completed !== undefined) {
      task.completed = body.completed
    }

    if (body.priority !== undefined) {
      task.priority = body.priority
    }

    if (body.deadline_date !== undefined) {
      task.deadlineDate = body.deadline_date
    }

    await task.save()

    return NextResponse.json({
      id: task._id.toString(),
      title: task.title,
      completed: task.completed,
      userId: task.userId.toString(),
      priority: task.priority,
      deadline_date: task.deadlineDate,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    })
  } catch (error: unknown) {
    console.error("Update task error:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

// DELETE a task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await connectDB()

    const task = await Task.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: unknown) {
    console.error("Delete task error:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
