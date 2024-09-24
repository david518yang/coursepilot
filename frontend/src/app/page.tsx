import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-8 gap-16 font-[family-name:var(--font-geist-sans)]">
      <header>
        <h1 className="text-lg">
          📝🚀 <b>Coursepilot</b>
        </h1>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center items-start">
        <SignedIn>
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Notetaking, accelerated
      </footer>
    </div>
  );
}
