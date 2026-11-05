import { useEffect, useState } from "react";
import api from "../../api/axios";
import { cacheContactInfo, mergeContactInfo } from "../../utils/useContactInfo";

const FIELDS = [
  { name: "address", label: "Office address (English)", required: true },
  { name: "addressBn", label: "Office address (বাংলা) — optional" },
  { name: "mapUrl", label: "Google Maps link", type: "url", placeholder: "https://maps.app.goo.gl/..." },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "facebook", label: "Facebook page link", type: "url", placeholder: "https://www.facebook.com/..." },
];

// Edits the contact details shown in the site footer and on the Contact Us page.
export default function ManageContactInfo() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    api
      .get("/contact-info")
      .then((res) => setForm(mergeContactInfo(res.data)))
      .catch(() => setStatus({ state: "error", message: "Could not load the current contact info. Refresh to try again." }));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const { data } = await api.put("/contact-info", form);
      cacheContactInfo(data);
      setForm(mergeContactInfo(data));
      setStatus({ state: "success", message: "Saved. The footer and Contact Us page now show these details." });
    } catch (err) {
      setStatus({ state: "error", message: err.response?.data?.message || "Could not save contact info." });
    }
  };

  return (
    <div>
      <div className="admin__topbar">
        <h1>Contact Info</h1>
      </div>

      <div className="admin-card" style={{ maxWidth: 720 }}>
        <p style={{ marginBottom: 20, color: "var(--ink-soil-60)" }}>
          Shown in the site footer and on the Contact Us page.
        </p>

        {!form && status.state !== "error" && <p>Loading...</p>}

        {form && (
          <form onSubmit={submit}>
            <div className="admin-form-grid">
              {FIELDS.map((f) => (
                <div className="field" key={f.name}>
                  <label htmlFor={f.name}>{f.label}</label>
                  <input
                    id={f.name}
                    type={f.type || "text"}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={update(f.name)}
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn--primary" disabled={status.state === "loading"}>
              {status.state === "loading" ? "Saving..." : "Save Contact Info"}
            </button>
          </form>
        )}

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
      </div>
    </div>
  );
}
