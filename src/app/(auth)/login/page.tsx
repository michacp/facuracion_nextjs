import { LoginForm } from "@/features/auth/components/LoginForm";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function LoginPage() {
  return (
    // 💡 Añadimos "relative" al contenedor principal
    <main className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-200">
      
      {/* 📌 Flotamos el botón en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* 🎯 El formulario se queda perfectamente centrado en la pantalla */}
      <LoginForm />
      
    </main>
  );
}