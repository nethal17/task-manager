import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name?: string
  emailVerified: boolean
  verificationToken?: string | null
  verificationTokenExpiry?: Date | null
  resetPasswordToken?: string | null
  resetPasswordTokenExpiry?: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    name: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.index({ verificationToken: 1 })
UserSchema.index({ resetPasswordToken: 1 })

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
