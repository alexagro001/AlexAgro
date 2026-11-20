import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { site } from "../../siteConfig";

const linkButtonStyle = {
  marginTop: 14,
  background: "none",
  border: 0,
  padding: 0,
  cursor: "pointer",
  textDecoration: "underline",
};

export default function AdminLogin() {
  const { login, verifyCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // login -> code (emailed sign-in code); forgot -> reset (emailed reset code)
  const [mode, setMode] = useState("login");
  const [reset, setReset] = useState({ newPassword: "", confirmPassword: "" });
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState({ id: "", maskedEmail: "" });
  const [cooldown, setCooldown] = useState(0);

  const updateReset = (field) => (e) => setReset((r) => ({ ...r, [field]: e.target.value }));

  // Counts down the seconds before "Resend code" can be used again.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
    setCode("");
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
        challengeId: challenge.id,
        code: code.trim(),
        newPassword: reset.newPassword,
      });
      setReset({ newPassword: "", confirmPassword: "" });
      setPassword("");
      setCode("");
      setMode("login");
      setNotice(data.message || "Password reset. You can sign in now.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { username });
      setChallenge({ id: data.challengeId, maskedEmail: "" });
      setCode("");
      setCooldown(30);
      setMode("reset");
      setNotice(data.message || "If that account exists, a reset code has been emailed.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the reset code");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      if (data.requiresCode) {
        setChallenge({ id: data.challengeId, maskedEmail: data.maskedEmail || "" });
        setPassword("");
        setCode("");
        setCooldown(30);
        setMode("code");
        return;
      }
      const redirectTo = location.state?.from || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyCode(challenge.id, code.trim());
      const redirectTo = location.state?.from || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify the code");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/auth/resend-code", { challengeId: challenge.id });
      setChallenge((c) => ({ id: data.challengeId, maskedEmail: data.maskedEmail || c.maskedEmail }));
      setCode("");
      setCooldown(30);
      setNotice("A new code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code");
    } finally {
      setLoading(false);
    }
  };

  const codeField = (
    <div className="field">
      <label htmlFor="code">6-digit code</label>
      <input
        id="code"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </div>
  );

  const resendButton = (
    <button
      type="button"
      className="form-note"
      style={linkButtonStyle}
      disabled={loading || cooldown > 0}
      onClick={resendCode}
    >
      {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
    </button>
  );

  return (
    <div className="admin admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <img src="/logo-full.png" alt={site.name} style={{ height: 40, width: "auto" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-soil-60)" }}>Admin Panel</div>
          </div>
        </div>

        {mode === "login" && (
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
            <button type="button" className="form-note" style={linkButtonStyle} onClick={() => switchMode("forgot")}>
              Forgot password?
            </button>
          </form>
        )}

        {mode === "code" && (
          <form onSubmit={submitCode}>
            <p className="form-note" style={{ marginBottom: 14 }}>
              We emailed a 6-digit code{challenge.maskedEmail ? ` to ${challenge.maskedEmail}` : ""}. Enter it below to finish signing in. It expires in 5 minutes.
            </p>
            {codeField}
            {notice && <p className="form-note" style={{ marginBottom: 14 }}>{notice}</p>}
            {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Checking..." : "Verify and sign in"}
            </button>
            <div>{resendButton}</div>
            <button type="button" className="form-note" style={linkButtonStyle} onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={submitForgot}>
            <p className="form-note" style={{ marginBottom: 14 }}>
              Enter your username. We will email a reset code to the admin address.
            </p>
            <div className="field">
              <label htmlFor="reset-username">Username</label>
              <input id="reset-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Sending..." : "Send reset code"}
            </button>
            <button type="button" className="form-note" style={linkButtonStyle} onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={submitReset}>
            {notice && <p className="form-note" style={{ marginBottom: 14 }}>{notice}</p>}
            {codeField}
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
            <div>{resendButton}</div>
            <button type="button" className="form-note" style={linkButtonStyle} onClick={() => switchMode("login")}>
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
