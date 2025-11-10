# My Task Manager

A modern, full-featured task management application built with Next.js 16, React 19, TypeScript, and Supabase. Organize your tasks efficiently with priorities, deadlines, and a beautiful, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## Features

### Core Features
- **Task Management** - Create, edit, delete, and organize tasks
- **Priority System** - Categorize tasks as Low, Medium, or High priority
- **Deadline Tracking** - Set optional deadlines for your tasks
- **Progress Tracking** - Separate views for active and completed tasks
- **Task Completion** - Mark tasks as complete/incomplete with a single click

### Authentication
- **Secure Authentication** - Email/password authentication via Supabase
- **User Registration** - Sign up with email verification
- **Password Reset** - Forgot password functionality with email recovery
- **Session Management** - Automatic session handling and middleware protection

### User Interface
- **Modern Design** - Clean, intuitive interface with shadcn/ui components
- **Responsive Layout** - Fully mobile-responsive design (works on all devices)
- **Toast Notifications** - Real-time feedback with React Hot Toast
- **Visual Indicators** - Color-coded priority badges and task states

### Error Handling
- **Comprehensive Exception System** - 20+ custom error classes
- **Error Boundary** - React Error Boundary for graceful error handling
- **Automatic Retries** - Smart retry mechanism with exponential backoff
- **User-Friendly Messages** - Clear error messages for all scenarios
- **Validation** - Input validation with detailed feedback

### Performance
- **Server Components** - Next.js App Router with server-side rendering
- **Optimized Builds** - Turbopack for fast builds and hot reload
- **Type Safety** - Full TypeScript coverage
- **Code Splitting** - Automatic code splitting and lazy loading

## Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Realtime subscriptions

### Form & State Management
- **[React Hook Form](https://react-hook-form.com/)** - Form validation
- **[date-fns](https://date-fns.org/)** - Date formatting and manipulation
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Prettier** - Code formatting (via ESLint)

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn or pnpm
- Supabase account (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/nethal17/task-manager.git
cd task-manager
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**
1. Go to [Supabase](https://supabase.com/)
2. Create a new project (or use existing)
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Low' NOT NULL,
  deadline_date DATE
);

-- Enable Row Level Security on the tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting Started
1. **Sign Up** - Create an account with your email
2. **Verify Email** - Check your email and verify your account
3. **Sign In** - Log in to access your dashboard
4. **Create Tasks** - Click "Add Task" to create your first task
5. **Organize** - Set priorities, deadlines, and track progress

### Task Management
- **Add Task**: Click the "Add Task" button in the dashboard
- **Edit Task**: Click the pencil icon on any active task
- **Complete Task**: Check the checkbox to mark as complete
- **Delete Task**: Click the trash icon to remove a task
- **Priority Badges**: Visual color coding (Red=High, Yellow=Medium, Blue=Low)

### Account Management
- **Sign Out**: Click the "Sign out" button in the dashboard
- **Reset Password**: Use "Forgot password?" link on login page

## 📁 Project Structure

```
task-manager/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group
│   │   ├── login/               # Login page
│   │   ├── signup/              # Sign up page
│   │   ├── forgot-password/     # Password reset request
│   │   └── reset-password/      # Password reset form
│   ├── dashboard/               # Main dashboard
│   ├── layout.tsx               # Root layout (with ErrorBoundary)
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ErrorBoundary.tsx    # Error boundary component
│   │   ├── add-task-dialog.tsx  # Add task dialog
│   │   └── edit-task-dialog.tsx # Edit task dialog
│   ├── lib/
│   │   ├── exceptions/          # Exception handling system
│   │   │   ├── errors.ts        # Custom error classes
│   │   │   ├── errorHandler.ts  # Error handling utilities
│   │   │   └── index.ts         # Exports
│   │   ├── supabase/            # Supabase clients
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Session middleware
│   │   ├── types/               # TypeScript types
│   │   └── utils.ts             # Utility functions
│   └── styles/                  # Additional styles
├── supabase/
│   └── migrations/
│       └── schema.sql           # Database schema and RLS policies
├── middleware.ts                # Next.js middleware
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
└── next.config.ts               # Next.js config
```

## 🛠️ Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

## Customization

### Colors
Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: oklch(0.648 0.2 131.684);
  --destructive: oklch(0.577 0.245 27.325);
  /* ... more colors */
}
```

### Components
All UI components are in `src/components/ui/` and can be customized individually.

## Security Features

- **Row Level Security (RLS)** - Database-level security policies
- **Secure Authentication** - Supabase Auth with JWT tokens
- **Session Management** - Automatic session refresh and validation
- **Input Validation** - Client and server-side validation
- **Error Handling** - Comprehensive error handling without exposing sensitive data
- **Environment Variables** - Secrets stored securely

## Error Handling

The app includes a comprehensive error handling system:

### Custom Error Classes
- `AuthenticationError` - Authentication failures
- `ValidationError` - Input validation errors
- `TaskNotFoundError` - Missing resources
- `NetworkError` - Network issues
- `SessionExpiredError` - Expired sessions
- And 15+ more specialized errors

### Error Handler Features
- Automatic retry with exponential backoff
- Timeout protection for async operations
- User-friendly error messages
- Supabase-specific error handling
- React Error Boundary for UI errors

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Nethal Fernando**
- GitHub: [@nethal17](https://github.com/nethal17)

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Primitives

## Support

If you have any questions or run into issues:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Built with ❤️ using Next.js, React, and Supabase**
