export type PriorityType = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  created_at: string
  updated_at: string
  title: string
  completed: boolean
  user_id: string
  priority: PriorityType
  deadline_date: string | null
}

export interface TaskInsert {
  title: string
  priority: PriorityType
  deadline_date?: string | null
  completed?: boolean
}
