import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-7xl text-accent">404</p>
      <h1 className="font-serif text-3xl">Page not found</h1>
      <Link href="/" className="mt-2 text-sm font-medium text-accent hover:text-accent-hover">
        Go home
      </Link>
    </div>
  );
}
