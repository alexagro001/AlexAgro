import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { site } from "../../siteConfig";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
          {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}
          <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="form-note" style={{ marginTop: 18 }}>
          First time here? The default admin account is created automatically from the
          <code> ADMIN_DEFAULT_USERNAME</code> / <code>ADMIN_DEFAULT_PASSWORD</code> values in
          <code> backend/.env</code>. Change the password after your first login.
        </p>
      </div>
    </div>
  );
}
