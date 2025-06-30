import { useAuthForm } from "./useAuthForm";
import AuthForm from "./AuthForm";

export default function AuthContainer() {
  const {
    email,
    password,
    setEmail,
    setPassword,
    message,
    mode,
    setMode,
    handleLogin,
    handleRegister,
  } = useAuthForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-md p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-500">
          GymPlify {mode === "login" ? "Login" : "Register"}
        </h1>
        <AuthForm
          {...{
            email,
            password,
            setEmail,
            setPassword,
            mode,
            setMode,
            handleLogin,
            handleRegister,
          }}
        />
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.startsWith("Welcome") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
