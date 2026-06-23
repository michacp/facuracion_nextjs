import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-su-bg transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <h1 className="text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
        Bienvenido al sistema
      </h1>

      <Link href="/login">
        <button className="su-brand px-6 py-3 rounded-2xl text-sm font-semibold hover:shadow-su-brand-lg hover:scale-[1.02] transition-all duration-200">
          Iniciar sesión
        </button>
      </Link>
    </main>
  );
}