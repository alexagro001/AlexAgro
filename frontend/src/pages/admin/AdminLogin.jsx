import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { site } from "../../siteConfig";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [reset, setReset] = useState({ recoveryKey: "", newPassword: "", confirmPassword: "" });
  const [notice, setNotice] = useState("");

  const updateReset = (field) => (e) => setReset((r) => ({ ...r, [field]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (reset.newPassword !== reset.confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/reset-password", {
        username,
        recoveryKey: reset.recoveryKey,
        newPassword: reset.newPassword,
      });
      setReset({ recoveryKey: "", newPassword: "", confirmPassword: "" });
      setPassword("");
      setMode("login");
      setNotice(data.message || "Password reset. You can sign in now.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      const redirectTo = location.state?.from || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <img src="/logo-full.png" alt={site.name} style={{ height: 40, width: "auto" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soil-60)" }}>Admin Panel</div>
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {notice && <p className="form-note" style={{ marginBottom: 14 }}>{notice}</p>}
            {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              className="form-note"
              style={{ marginTop: 14, background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => switchMode("reset")}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset}>
            <p className="form-note" style={{ marginBottom: 14 }}>
              Enter your username, the admin recovery key and a new password.
            </p>
            <div className="field">
              <label htmlFor="reset-username">Username</label>
              <input id="reset-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="recoveryKey">Recovery key</label>
              <input id="recoveryKey" required autoComplete="off" value={reset.recoveryKey} onChange={updateReset("recoveryKey")} />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New password</label>
              <input id="newPassword" type="password" required minLength={6} value={reset.newPassword} onChange={updateReset("newPassword")} />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input id="confirmPassword" type="password" required minLength={6} value={reset.confirmPassword} onChange={updateReset("confirmPassword")} />
            </div>
            {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </button>
            <button
              type="button"
              className="form-note"
              style={{ marginTop: 14, background: "none", border: 0, padding: 0, cursor: "pointer", textDecoration: "underline" }}
              onClick={() => switchMode("login")}
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
