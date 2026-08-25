import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [banners, dealers, distributors, products, gallery, careers, contacts] = await Promise.all([
          api.get("/banners", { params: { active: "all" } }),
          api.get("/dealers", { params: { active: "all" } }),
          api.get("/distributors", { params: { active: "all" } }),
          api.get("/products", { params: { active: "all" } }),
          api.get("/gallery", { params: { active: "all" } }),
          api.get("/careers", { params: { active: "all" } }),
          api.get("/contact"),
        ]);

        setStats({
          banners: banners.data.length,
          dealers: dealers.data.length,
          distributors: distributors.data.length,
          products: products.data.length,
          gallery: gallery.data.length,
          careers: careers.data.length,
          messages: contacts.data.length,
          unread: contacts.data.filter((m) => !m.isRead).length,
        });
        setMessages(contacts.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard", err);
      }
    })();
  }, []);

  return (
    <div>
      <div className="admin__topbar">
        <h1>Dashboard</h1>
      </div>

      {stats && (
        <div className="admin-stats">
          <Stat num={stats.banners} label="Homepage Banners" />
          <Stat num={stats.dealers} label="Dealers" />
          <Stat num={stats.distributors} label="Sales Officers" />
          <Stat num={stats.products} label="Products" />
          <Stat num={stats.gallery} label="Gallery Items" />
          <Stat num={stats.careers} label="Career Posts" />
          <Stat num={stats.unread} label="Unread Messages" />
        </div>
      )}

      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3>Recent Inquiries</h3>
          <Link to="/admin/messages" className="btn btn--sm">
            View all
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="empty-state">No messages yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m._id}>
                  <td>{m.name} <br /><span style={{ color: "var(--ink-soil-60)", fontSize: "0.8rem" }}>{m.email}</span></td>
                  <td>{m.subject || "—"}</td>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${m.isRead ? "badge--on" : "badge--off"}`}>
                      {m.isRead ? "Read" : "New"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat__num">{num ?? "—"}</div>
      <div className="admin-stat__label">{label}</div>
    </div>
  );
}
