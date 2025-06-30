export default function AuthForm({
  email,
  password,
  setEmail,
  setPassword,
  mode,
  setMode,
  handleLogin,
  handleRegister,
}) {
  return (
    <form
      onSubmit={mode === "login" ? handleLogin : handleRegister}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {mode === "login" ? "Login" : "Register"}
      </button>

      <button
        type="button"
        className="text-sm underline mt-2"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        Switch to {mode === "login" ? "Register" : "Login"}
      </button>
    </form>
  );
}
