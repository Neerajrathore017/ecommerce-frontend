"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "../../services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });

      const token = response.accessToken || response.token;

      if (!token) {
        throw new Error("Login response does not contain a token.");
      }

      localStorage.setItem("accessToken", token);

      // Navigate after successful authentication.
      await router.push("/products");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>
          Sign in to your ecommerce account
        </p>

        <label htmlFor="email" style={styles.label}>
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>
          Password
        </label>

        <div style={styles.passwordWrapper}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.passwordInput}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            style={styles.showButton}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={styles.submitButton}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#f3f4f6",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    marginBottom: "28px",
    color: "#6b7280",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#374151",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
  },
  passwordWrapper: {
    display: "flex",
    marginBottom: "20px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    overflow: "hidden",
  },
  passwordInput: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    padding: "12px",
    border: "none",
    outline: "none",
    fontSize: "15px",
  },
  showButton: {
    border: "none",
    padding: "0 12px",
    background: "#ffffff",
    cursor: "pointer",
    color: "#374151",
  },
  error: {
    color: "#dc2626",
    fontSize: "14px",
  },
  submitButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
};
