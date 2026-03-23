import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { createBug } from "../store/bugsSlice";
import api from "../services/api";
import "./ReportBugPage.css";

const ReportBugPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.bugs);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reproductionSteps: "",
    severity: "Low",
    assigneeId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [developers, setDevelopers] = useState<
    { id: string; fullName: string }[]
  >([]);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    api.get("/bugs/developers").then(({ data }) => setDevelopers(data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createBug(form));
    if (createBug.fulfilled.match(result)) {
      const bugId = result.payload.id;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        await api.post(`/bugs/${bugId}/attachments`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setSuccess("Bug reported successfully!");
      setTimeout(() => navigate("/bugs"), 1500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_FILE_SIZE) {
      alert("File size must be less than 5MB");
      e.target.value = ""; // reset the input
      setFile(null);
      return;
    }
    setFile(selected);
  };

  return (
    <div className="report-page">
      <div className="report-card">
        <h1 className="report-title">Report a Bug</h1>
        <p className="report-sub">
          Provide as much detail as possible to help developers reproduce the
          issue.
        </p>

        {success && <div className="success-msg">✓ {success}</div>}
        {error && <div className="error-msg">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Bug Title *</label>
            <input
              type="text"
              required
              placeholder="Short descriptive title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              required
              placeholder="Describe the bug in detail..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Reproduction Steps *</label>
            <textarea
              required
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              value={form.reproductionSteps}
              onChange={(e) =>
                setForm({ ...form, reproductionSteps: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Severity</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assign To (optional)</label>
            <select
              className="form-select"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">-- Select a Developer --</option>
              {developers.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Attachment (screenshot / log)</label>
            <input
              type="file"
              className="file-input"
              accept="image/*,.log,.txt,.pdf"
              onChange={handleFileChange}
            />
            {file && (
              <p className="file-name">
                📎 {file.name} — {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/bugs")}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Report Bug"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportBugPage;
