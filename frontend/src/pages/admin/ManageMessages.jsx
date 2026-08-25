import { Fragment, useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/contact")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleOpen = async (msg) => {
    const willOpen = openId !== msg._id;
    setOpenId(willOpen ? msg._id : null);
    if (willOpen && !msg.isRead) {
      try {
        await api.patch(`/contact/${msg._id}/read`);
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await api.delete(`/contact/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin__topbar">
        <h1>Messages</h1>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <p className="loading-state">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="empty-state">No inquiries yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <Fragment key={m._id}>
                  <tr>
                    <td>
                      <span className={`badge ${m.isRead ? "badge--on" : "badge--off"}`}>
                        {m.isRead ? "Read" : "New"}
                      </span>
                    </td>
                    <td>{m.name}</td>
                    <td>{m.subject || "—"}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn--sm" onClick={() => toggleOpen(m)}>
                          {openId === m._id ? "Hide" : "View"}
                        </button>
                        <button className="btn btn--sm btn--danger" onClick={() => remove(m._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openId === m._id && (
                    <tr key={`${m._id}-detail`}>
                      <td colSpan={5} style={{ background: "#faf8f2" }}>
                        <p style={{ marginBottom: 6 }}>
                          <strong>Email:</strong> <a href={`mailto:${m.email}`}>{m.email}</a>
                          {m.phone && <> &nbsp;·&nbsp; <strong>Phone:</strong> {m.phone}</>}
                        </p>
                        <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
                        <p className="form-note">
                          {m.emailSent ? "Emailed to your inbox at submission time." : "Email delivery was not configured when this was submitted."}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
