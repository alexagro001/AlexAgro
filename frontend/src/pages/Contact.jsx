import { useState } from "react";
import PageHeader from "../components/PageHeader";
import LeafButton from "../components/LeafButton";
import LeafIcon from "../components/LeafIcon";
import api from "../api/axios";
import { site } from "../siteConfig";
import { useLanguage } from "../context/LanguageContext";
import { gmailComposeLink } from "../utils/links";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const { t } = useLanguage();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ state: "loading", message: "" });
    try {
      const { data } = await api.post("/contact", form);
      setStatus({ state: "success", message: t(data.message) });
      setForm(initialForm);
    } catch (err) {
      setStatus({
        state: "error",
        message: err.response?.data?.message ? t(err.response.data.message) : t("Something went wrong. Please try again."),
      });
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Get in Touch" title="Contact Us" description="Every message here reaches our team's inbox directly." />

      <section className="section">
        <div className="container grid grid--2">
          <form onSubmit={submit} className="card" style={{ padding: 28 }}>
            <div className="field">
              <label htmlFor="name">{t("Full name")}</label>
              <input id="name" required value={form.name} onChange={update("name")} />
            </div>
            <div className="field">
              <label htmlFor="email">{t("Email")}</label>
              <input id="email" type="email" required value={form.email} onChange={update("email")} />
            </div>
            <div className="field">
              <label htmlFor="phone">{t("Phone (optional)")}</label>
              <input id="phone" value={form.phone} onChange={update("phone")} />
            </div>
            <div className="field">
              <label htmlFor="subject">{t("Subject")}</label>
              <input id="subject" value={form.subject} onChange={update("subject")} />
            </div>
            <div className="field">
              <label htmlFor="message">{t("Message")}</label>
              <textarea id="message" required value={form.message} onChange={update("message")} />
            </div>

            <LeafButton type="submit" disabled={status.state === "loading"}>
              {status.state === "loading" ? `${t("Sending")}...` : t("Send Message")}
            </LeafButton>

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

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card tile">
              <div className="tile__icon"><LeafIcon size={20} /></div>
              <h3>{t("Head Office")}</h3>
              <p style={{ fontWeight: 700, color: "var(--ink-soil)" }}>{site.address}</p>
            </div>
            <div className="card tile">
              <div className="tile__icon"><LeafIcon size={20} /></div>
              <h3>{t("Phone")}</h3>
              <p style={{ fontWeight: 700 }}>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
              </p>
            </div>
            <div className="card tile">
              <div className="tile__icon"><LeafIcon size={20} /></div>
              <h3>{t("Email")}</h3>
              <p style={{ fontWeight: 700 }}>
                <a href={gmailComposeLink(site.email)} target="_blank" rel="noreferrer">{site.email}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
