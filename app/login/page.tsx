"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-tax-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[40px] mb-2">&#x1F9FE;</div>
          <h1 className="text-2xl font-extrabold text-tax-text font-serif">
            Taxes, Explained
          </h1>
          <p className="text-tax-muted text-sm mt-1 font-sans">
            Sign in to access your tax guide
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full py-3 px-4 rounded-lg border border-tax-border bg-tax-surface text-tax-text text-sm font-sans outline-none focus:border-tax-accent transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full py-3 px-4 rounded-lg border border-tax-border bg-tax-surface text-tax-text text-sm font-sans outline-none focus:border-tax-accent transition-colors"
          />

          {error && (
            <div className="text-sm text-tax-red bg-tax-red/10 border border-tax-red/20 rounded-lg px-4 py-2.5 font-sans">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-3 rounded-lg border-none text-sm font-bold font-sans transition-colors ${
              loading || !username || !password
                ? "bg-tax-border text-tax-dim cursor-default"
                : "bg-tax-accent text-white cursor-pointer"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
