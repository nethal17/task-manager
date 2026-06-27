# My Task Manager

A modern, full-featured task management application built with Next.js 16, React 19, TypeScript, and MongoDB. Organize your tasks efficiently with priorities, deadlines, and a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## Features

### Task Management
- **Create Tasks** - Add tasks with titles, priorities, and optional deadlines
- **Edit Tasks** - Modify task details at any time
- **Delete Tasks** - Remove tasks with confirmation dialog
- **Complete Tasks** - Toggle task completion status
- **Priority Levels** - Low, Medium, High with color-coded UI
- **Deadline Tracking** - Set optional due dates with calendar picker

### Authentication
- **Secure Authentication** - Email/password authentication via NextAuth.js
- **Email Verification** - Verify email on signup via Nodemailer
- **User Registration** - Sign up with email verification
- **Password Reset** - Forgot password functionality with email recovery
- **Session Management** - JWT-based sessions with automatic refresh
- **Protected Routes** - Middleware-based route protection

### UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Built with shadcn/ui components
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful error recovery with retry logic
- **Confirmation Dialogs** - Prevent accidental deletions

## Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library (New York style)
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[react-hot-toast](https://react-hot-toast.com/)** - Toast notifications
- **[date-fns](https://date-fns.org/)** - Date utilities

### Backend & Database
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **[NextAuth.js v5](https://authjs.dev/)** - Authentication
- **[Nodemailer](https://nodemailer.com/)** - Email sending (verification & password reset)
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- MongoDB Atlas account (free tier available)
- SMTP email service (Gmail, SendGrid, etc.)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd task-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000

# SMTP (for email verification and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get your MongoDB Atlas credentials:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string from Connect > Drivers

**To generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
task-manager/
├── app/
│   ├── (auth)/                 # Auth route group
│   │   ├── login/              # Login page
│   │   ├── signup/             # Registration page
│   │   ├── forgot-password/    # Forgot password page
│   │   ├── reset-password/     # Reset password page
│   │   ├── verify-email/       # Email verification page
│   │   └── layout.tsx          # Auth layout
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   ├── signup/         # Signup API
│   │   │   ├── verify-email/   # Email verification API
│   │   │   ├── forgot-password/# Forgot password API
│   │   │   └── reset-password/ # Reset password API
│   │   └── tasks/
│   │       ├── route.ts        # GET all / POST new task
│   │       └── [id]/route.ts   # PATCH / DELETE task
│   ├── dashboard/              # Main dashboard
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── add-task-dialog.tsx
│   │   ├── edit-task-dialog.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── providers.tsx       # NextAuth SessionProvider
│   └── lib/
│       ├── auth.ts             # NextAuth configuration
│       ├── mail.ts             # Nodemailer email utilities
│       ├── db/
│       │   ├── mongoose.ts     # MongoDB connection
│       │   └── models/
│       │       ├── User.ts     # User model
│       │       └── Task.ts     # Task model
│       ├── exceptions/         # Error handling
│       │   ├── errors.ts
│       │   ├── errorHandler.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── auth.ts
│       │   ├── task.ts
│       │   └── next-auth.d.ts  # NextAuth type augmentation
│       └── utils.ts
├── middleware.ts               # NextAuth route protection
├── .env.example                # Environment variable template
└── package.json
```

## Security

- **Password Hashing** - bcrypt with 12 salt rounds
- **JWT Sessions** - Secure token-based authentication
- **Route Protection** - Middleware-based access control
- **Input Validation** - Server-side validation on all API routes
- **Email Verification** - Prevents unauthorized account creation
- **Token Expiration** - Time-limited verification and reset tokens

## Error Handling

- Custom error class hierarchy
- Centralized error handler with toast notifications
- Retry logic with exponential backoff for network errors
- React Error Boundary for UI errors
- User-friendly error messages

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run lint:fix # Fix lint errors
```

## License

MIT

---

**Built with ❤️ using Next.js, React, MongoDB, and NextAuth.js**
