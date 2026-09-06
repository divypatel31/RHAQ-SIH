import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, FormField, Banner } from "../../components/common";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(phone.trim(), password);
      navigate(user.role === "patient" ? "/patient/book-appointment" : "/staff/referrals");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your phone number and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-2xl font-semibold text-ink tracking-tight">RHAQ</p>
          <p className="text-sm text-ink/50 mt-1.5">Rural Health Access & Quality Improvement System</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-8">
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label="Phone Number" required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit phone number"
              autoFocus
            />
          </FormField>
          <FormField label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </FormField>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
