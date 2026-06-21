import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";

 
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950 transition-colors duration-200">
           <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
        Bienvenido al sistema
      </h1>

      <Link href="/login">
        <button className="px-6 py-3 bg-brand-indigo text-white rounded-lg hover:bg-brand-indigo-dark transition-colors duration-200">
          Iniciar sesión
        </button>
      </Link>

 
    </main>
  );
}