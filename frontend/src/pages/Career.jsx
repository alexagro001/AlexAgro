import { useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import LeafButton from "../components/LeafButton";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const initialForm = { fullName: "", email: "" };

export default function Career() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const fileInputRef = useRef(null);
  const { t } = useLanguage();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      setStatus({ state: "error", message: t("CV is too large. Please use a file under 5MB.") });
      e.target.value = "";
      return;
    }
    setFile(selected);
    setStatus({ state: "idle", message: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ state: "error", message: t("Please attach your CV (PDF or Word document).") });
      return;
    }

    setStatus({ state: "loading", message: "" });
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("cv", file);

      const { data } = await api.post("/career-applications", formData);
      setStatus({ state: "success", message: t(data.message) });
      setForm(initialForm);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus({
        state: "error",
        message: err.response?.data?.message ? t(err.response.data.message) : t("Something went wrong. Please try again."),
      });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Join Our Team"
        title="Career"
        description="Send us your CV — our team reviews every application personally."
      />
      <section className="section">
        <div className="container" style={{ maxWidth: 560, margin: "0 auto" }}>
          <form onSubmit={submit} className="card" style={{ padding: 28 }}>
            <div className="field">
              <label htmlFor="fullName">{t("Full name")}</label>
              <input id="fullName" required value={form.fullName} onChange={update("fullName")} />
            </div>
            <div className="field">
              <label htmlFor="email">{t("Email")}</label>
              <input id="email" type="email" required value={form.email} onChange={update("email")} />
            </div>
            <div className="field">
              <label htmlFor="cv">{t("CV (PDF or Word, max 5MB)")}</label>
              {/* Custom face for the file input: the browser's own "Choose file"
                  text can't be translated, so the real input is visually hidden. */}
              <div className="file-pick">
                <input
                  ref={fileInputRef}
                  id="cv"
                  className="file-pick__input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFile}
                  required
                />
                <label htmlFor="cv" className="file-pick__button">{t("Choose file")}</label>
                <span className="file-pick__name">{file ? file.name : t("No file chosen")}</span>
              </div>
            </div>

            <LeafButton type="submit" disabled={status.state === "loading"}>
              {status.state === "loading" ? `${t("Sending")}...` : t("Submit Application")}
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
        </div>
      </section>
    </div>
  );
}
