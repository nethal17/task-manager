"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import type { Task } from "@/lib/types/task"
import { LogOutIcon } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast.error("Failed to load tasks")
      console.error(error)
      return
    }

    setTasks(data || [])
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      
      setUser(user)
      setIsLoading(false)
      fetchTasks()
    }

    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId)

    if (error) {
      toast.error("Failed to update task")
      console.error(error)
      return
    }

    toast.success(currentStatus ? "Task marked as incomplete" : "Task completed!")
    fetchTasks()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    setDeletingTask({ id: taskId, title: taskTitle } as Task)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!deletingTask) return

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", deletingTask.id)

    if (error) {
      toast.error("Failed to delete task")
      console.error(error)
      return
    }

    toast.success("Task deleted successfully")
    setIsDeleteDialogOpen(false)
    setDeletingTask(null)
    fetchTasks()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.completed)
  const activeTasks = tasks.filter(task => !task.completed)

  return (
    <div className="min-h-screen bg-background p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary">My Tasks</h1>
            <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <div className="flex gap-2">
            {user && <AddTaskDialog userId={user.id} onTaskAdded={fetchTasks} />}
            <Button variant="destructive" onClick={handleSignOut} className="p-6 cursor-pointer">
              <LogOutIcon className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Tasks</CardTitle>
              <CardDescription>All your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{tasks.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active</CardTitle>
              <CardDescription>Tasks in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{activeTasks.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Tasks you&apos;ve finished</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{completedTasks.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Active Tasks</CardTitle>
                <CardDescription>Tasks in progress</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/50 border border-red-300 dark:border-red-800"></div>
                  <span className="text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-800"></div>
                  <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-800"></div>
                  <span className="text-muted-foreground">Low</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active tasks. Click &quot;Add Task&quot; to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      task.priority === "High" 
                        ? "bg-red-50 border-red-300 hover:bg-red-100/70 dark:bg-red-950/20 dark:border-red-900/50 dark:hover:bg-red-950/30" 
                        : task.priority === "Medium" 
                        ? "bg-yellow-50 border-yellow-300 hover:bg-yellow-100/70 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:hover:bg-yellow-950/30" 
                        : "bg-blue-50 border-blue-300 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                        aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                      <div>
                        <p className="font-medium">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.deadline_date ? `Due: ${new Date(task.deadline_date).toLocaleDateString()}` : "No deadline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="cursor-pointer"
                        onClick={() => handleEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        aria-label={`Delete ${task.title}`}
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-2xl">Completed Tasks</CardTitle>
              <CardDescription>Tasks you&apos;ve finished</CardDescription>
            </div>  
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No completed tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                        aria-label={`Mark ${task.title} as incomplete`}
                      />
                      <div>
                        <p className="font-medium line-through text-muted-foreground">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.deadline_date ? `Due: ${new Date(task.deadline_date).toLocaleDateString()}` : "No deadline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="cursor-pointer"
                        onClick={() => handleEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        aria-label={`Delete ${task.title}`}
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {editingTask && (
          <EditTaskDialog
            task={editingTask}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onTaskUpdated={fetchTasks}
          />
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the task &quot;{deletingTask?.title}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTask}
                className="bg-destructive text-background hover:bg-destructive/90 cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
