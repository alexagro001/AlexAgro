import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { site } from "../../siteConfig";
import LeafIcon from "../../components/LeafIcon";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/banners", label: "Homepage Banners" },
  { to: "/admin/dealers", label: "Dealers" },
  { to: "/admin/distributors", label: "Sales Officers" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/career-applications", label: "Career Applications" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <span className="admin__brand-chip">
            <img src="/logo-full.png" alt={site.name} />
          </span>
        </div>
        <ul className="admin__nav">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
                <LeafIcon size={14} />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="admin__logout">
          <p style={{ fontSize: "0.78rem", color: "rgba(246,241,228,0.6)", padding: "0 12px 8px" }}>
            Signed in as <strong>{admin?.username}</strong>
          </p>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
