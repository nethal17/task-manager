import { Button } from "styles/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold text-zinc-900 dark:text-white sm:text-6xl">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
          <Button variant="default" size="lg" className="mt-8 block mx-auto">
          Get Started
          </Button>
        </h1>
      </main>
    </div>
  );
}
