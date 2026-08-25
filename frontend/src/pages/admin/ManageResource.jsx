import { useEffect, useState } from "react";
import api from "../../api/axios";
import MapPicker from "../../components/MapPicker";
import MediaUploadField from "../../components/MediaUploadField";
import { geocodeAddress } from "../../utils/geocode";

function buildEmptyForm(fields) {
  const form = {};
  fields.forEach((f) => {
    form[f.name] = f.type === "checkbox" ? f.default ?? false : f.default ?? "";
  });
  return form;
}

export default function ManageResource({ config }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => buildEmptyForm(config.fields));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateMsg, setLocateMsg] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get(config.endpoint, { params: { active: "all" } })
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    setShowForm(false);
    setEditingId(null);
    setForm(buildEmptyForm(config.fields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key]);

  const openCreate = () => {
    setEditingId(null);
    setForm(buildEmptyForm(config.fields));
    setError("");
    setLocateMsg("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    const next = buildEmptyForm(config.fields);
    config.fields.forEach((f) => {
      if (item[f.name] !== undefined && item[f.name] !== null) {
        next[f.name] = f.type === "date" ? String(item[f.name]).slice(0, 10) : item[f.name];
      }
    });
    setForm(next);
    setError("");
    setLocateMsg("");
    setShowForm(true);
  };

  const updateField = (name, value) => {
    setForm((prev) => {
      let next = { ...prev, [name]: value };
      if (config.onFieldChange) {
        const extra = config.onFieldChange(name, value, next);
        if (extra) next = { ...next, ...extra };
      }
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      config.fields.forEach((f) => {
        if (f.type === "number" && payload[f.name] !== "") {
          payload[f.name] = Number(payload[f.name]);
        }
      });

      if (editingId) {
        await api.put(`${config.endpoint}/${editingId}`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Check the required fields.");
    } finally {
      setSaving(false);
    }
  };

  const locateOnMap = async () => {
    const addressParts = [form.area || form.territory, form.district, form.division, "Bangladesh"].filter(
      Boolean
    );
    if (addressParts.length < 2) {
      setLocateMsg("Pick a Division and District (and ideally an Area/Street) first.");
      return;
    }

    setLocating(true);
    setLocateMsg("");
    try {
      const point = await geocodeAddress(addressParts.join(", "));
      if (point) {
        updateField("lat", point.lat);
        updateField("lng", point.lng);
        setLocateMsg("Pin updated. Fine-tune by clicking the map if needed.");
      } else {
        setLocateMsg("Couldn't find that address — try a shorter area name, or click the map directly.");
      }
    } catch (err) {
      setLocateMsg(err.message || "Location lookup failed.");
    } finally {
      setLocating(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api.delete(`${config.endpoint}/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete");
    }
  };

  const columnLabel = (key) => {
    const field = config.fields.find((f) => f.name === key);
    return field ? field.label : key;
  };

  const renderCell = (item, key) => {
    const value = item[key];
    if (typeof value === "boolean") {
      return <span className={`badge ${value ? "badge--on" : "badge--off"}`}>{value ? "Active" : "Hidden"}</span>;
    }
    return value ?? "—";
  };

  return (
    <div>
      <div className="admin__topbar">
        <h1>{config.title}</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          + Add {config.singular}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>{editingId ? `Edit ${config.singular}` : `Add ${config.singular}`}</h3>
          <form onSubmit={submit}>
            <div className="admin-form-grid">
              {config.fields
                .filter((f) => f.type !== "checkbox" && f.type !== "media")
                .map((f) => (
                  <div className="field" key={f.name}>
                    <label htmlFor={f.name}>{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        id={f.name}
                        required={f.required}
                        value={form[f.name]}
                        onChange={(e) => updateField(f.name, e.target.value)}
                      >
                        <option value="">Select...</option>
                        {(f.dynamicOptions ? f.dynamicOptions(form) : f.options).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        id={f.name}
                        required={f.required}
                        value={form[f.name]}
                        onChange={(e) => updateField(f.name, e.target.value)}
                      />
                    ) : (
                      <input
                        id={f.name}
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        step={f.type === "number" ? "any" : undefined}
                        required={f.required}
                        value={form[f.name]}
                        onChange={(e) => updateField(f.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
            </div>

            {config.fields
              .filter((f) => f.type === "media")
              .map((f) => (
                <div className="field" key={f.name}>
                  <label htmlFor={f.name}>{f.label}</label>
                  <MediaUploadField
                    id={f.name}
                    value={form[f.name]}
                    onChange={(url) => updateField(f.name, url)}
                    accept={f.accept}
                  />
                </div>
              ))}

            {config.hasMap && (
              <div className="field">
                <label>Location</label>
                <p className="form-note" style={{ marginBottom: 8 }}>
                  Pick Division + District above and the pin jumps to that area automatically.
                  For an exact spot, add an Area/Street and click "Locate on map", or click
                  anywhere on the map yourself.
                </p>
                <button type="button" className="btn btn--sm" onClick={locateOnMap} disabled={locating} style={{ marginBottom: 10 }}>
                  {locating ? "Locating..." : "📍 Locate on map from address"}
                </button>
                {locateMsg && <p className="form-note">{locateMsg}</p>}
                <MapPicker
                  lat={form.lat === "" ? undefined : Number(form.lat)}
                  lng={form.lng === "" ? undefined : Number(form.lng)}
                  onChange={(lat, lng) => {
                    updateField("lat", lat);
                    updateField("lng", lng);
                  }}
                />
                <p className="form-note">Lat: {form.lat || "—"} · Lng: {form.lng || "—"} (click the map to adjust)</p>
              </div>
            )}

            {config.fields
              .filter((f) => f.type === "checkbox")
              .map((f) => (
                <label key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={!!form[f.name]}
                    onChange={(e) => updateField(f.name, e.target.checked)}
                  />
                  {f.label}
                </label>
              ))}

            {error && <p className="form-note form-note--error" style={{ marginBottom: 14 }}>{error}</p>}

            <div className="admin-actions">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <p className="loading-state">Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No {config.title.toLowerCase()} yet. Add the first one above.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c}>{columnLabel(c)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {config.columns.map((c) => (
                    <td key={c}>{renderCell(item, c)}</td>
                  ))}
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn--sm" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn--sm btn--danger" onClick={() => remove(item._id)}>
                        Delete
                      </button>
                    </div>
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
