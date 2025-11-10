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
import toast from "react-hot-toast"
import type { User } from "@supabase/supabase-js"
import type { Task } from "@/lib/types/task"
import { LogOutIcon } from "lucide-react"
import { handleError, handleSupabaseError, withRetry } from "@/lib/exceptions"

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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const tasks = await withRetry(async () => {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw handleSupabaseError(error)
        return data || []
      })

      setTasks(tasks)
    } catch (error) {
      handleError(error, 'Fetch Tasks')
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw handleSupabaseError(error)
        
        if (!user) {
          router.push("/login")
          return
        }
        
        setUser(user)
        setIsLoading(false)
        fetchTasks()
      } catch (error) {
        handleError(error, 'Get User', {
          redirectOnAuth: true
        })
        setIsLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw handleSupabaseError(error)
      
      toast.success("Signed out successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      handleError(error, 'Sign Out')
    }
  }

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", taskId)

      if (error) throw handleSupabaseError(error)

      toast.success(currentStatus ? "Task marked as incomplete" : "Task completed!")
      fetchTasks()
    } catch (error) {
      handleError(error, 'Toggle Task Complete')
    }
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

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", deletingTask.id)

      if (error) throw handleSupabaseError(error)

      toast.success("Task deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeletingTask(null)
      fetchTasks()
    } catch (error) {
      handleError(error, 'Delete Task')
    }
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
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">My Tasks</h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button variant="destructive" onClick={handleSignOut} className="p-6 sm:p-6 cursor-pointer whitespace-nowrap">
              <LogOutIcon className="h-4 w-4" />
              <span className="sm:inline">Sign out</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">Active Tasks</CardTitle>
                <CardDescription>Tasks in progress</CardDescription>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-200 dark:bg-red-900/50 border border-red-300 dark:border-red-800"></div>
                  <span className="text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-200 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-800"></div>
                  <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-200 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-800"></div>
                  <span className="text-muted-foreground">Low</span>
                </div>
              </div>
              <div>
                {user && <AddTaskDialog userId={user.id} onTaskAdded={fetchTasks} />}
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
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg transition-colors gap-3 ${
                      task.priority === "High" 
                        ? "bg-red-50 border-red-300 hover:bg-red-100/70 dark:bg-red-950/20 dark:border-red-900/50 dark:hover:bg-red-950/30" 
                        : task.priority === "Medium" 
                        ? "bg-yellow-50 border-yellow-300 hover:bg-yellow-100/70 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:hover:bg-yellow-950/30" 
                        : "bg-blue-50 border-blue-300 hover:bg-blue-100/70 dark:bg-blue-950/20 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                        aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.deadline_date ? `Due: ${new Date(task.deadline_date).toLocaleDateString()}` : "No deadline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-3">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="cursor-pointer shrink-0"
                        onClick={() => handleEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        aria-label={`Delete ${task.title}`}
                        className="text-destructive hover:text-destructive cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <CardTitle className="text-xl sm:text-2xl">Completed Tasks</CardTitle>
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                        aria-label={`Mark ${task.title} as incomplete`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium line-through text-muted-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.deadline_date ? `Due: ${new Date(task.deadline_date).toLocaleDateString()}` : "No deadline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-3">
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        className="cursor-not-allowed opacity-50 shrink-0 relative"
                        disabled
                        aria-label="Cannot edit completed task"
                        title="Cannot edit completed tasks"
                      >
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-destructive rotate-45 rounded-full" />
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        aria-label={`Delete ${task.title}`}
                        className="text-destructive hover:text-destructive cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
