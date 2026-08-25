import { Fragment, useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManageCareerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/career-applications")
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleOpen = async (app) => {
    const willOpen = openId !== app._id;
    setOpenId(willOpen ? app._id : null);
    if (willOpen && !app.isRead) {
      try {
        await api.patch(`/career-applications/${app._id}/read`);
        setApplications((prev) => prev.map((a) => (a._id === app._id ? { ...a, isRead: true } : a)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    await api.delete(`/career-applications/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin__topbar">
        <h1>Career Applications</h1>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {loading ? (
          <p className="loading-state">Loading...</p>
        ) : applications.length === 0 ? (
          <p className="empty-state">No CVs submitted yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <Fragment key={a._id}>
                  <tr>
                    <td>
                      <span className={`badge ${a.isRead ? "badge--on" : "badge--off"}`}>
                        {a.isRead ? "Read" : "New"}
                      </span>
                    </td>
                    <td>{a.fullName}</td>
                    <td>{a.email}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn--sm" onClick={() => toggleOpen(a)}>
                          {openId === a._id ? "Hide" : "View"}
                        </button>
                        <button className="btn btn--sm btn--danger" onClick={() => remove(a._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openId === a._id && (
                    <tr>
                      <td colSpan={5} style={{ background: "#faf8f2" }}>
                        <p style={{ marginBottom: 6 }}>
                          <strong>Email:</strong> <a href={`mailto:${a.email}`}>{a.email}</a>
                        </p>
                        <a className="btn btn--sm btn--primary" href={a.cvUrl} target="_blank" rel="noreferrer">
                          Download CV{a.cvFilename ? ` — ${a.cvFilename}` : ""}
                        </a>
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
