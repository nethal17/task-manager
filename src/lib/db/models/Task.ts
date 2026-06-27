import mongoose, { Schema, type Document } from "mongoose"

export type PriorityType = "Low" | "Medium" | "High"

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  completed: boolean
  userId: mongoose.Types.ObjectId
  priority: PriorityType
  deadlineDate: string | null
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    deadlineDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

TaskSchema.index({ userId: 1, createdAt: -1 })

const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)

export default Task
