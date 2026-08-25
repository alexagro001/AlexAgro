import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminSettings() {
  const { admin } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ state: "error", message: "New password and confirmation don't match." });
      return;
    }
    if (form.newPassword.length < 6) {
      setStatus({ state: "error", message: "New password must be at least 6 characters." });
      return;
    }

    setStatus({ state: "loading", message: "" });
    try {
      const { data } = await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus({ state: "success", message: data.message || "Password updated successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({
        state: "error",
        message: err.response?.data?.message || "Could not update password.",
      });
    }
  };

  return (
    <div>
      <div className="admin__topbar">
        <h1>Settings</h1>
      </div>

      <div className="admin-card" style={{ maxWidth: 440 }}>
        <p style={{ marginBottom: 4 }}>
          <strong>Username:</strong> {admin?.username}
        </p>
        <p style={{ marginBottom: 20, color: "var(--ink-soil-60)" }}>
          Logged in as {admin?.name || admin?.username}
        </p>

        <h3 style={{ marginBottom: 14 }}>Change Password</h3>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              required
              value={form.currentPassword}
              onChange={update("currentPassword")}
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              value={form.newPassword}
              onChange={update("newPassword")}
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={status.state === "loading"}>
            {status.state === "loading" ? "Updating..." : "Update Password"}
          </button>

          {status.state === "success" && (
            <p className="form-note form-note--success" style={{ marginTop: 14 }}>
              {status.message}
            </p>
          )}
          {status.state === "error" && (
            <p className="form-note form-note--error" style={{ marginTop: 14 }}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
