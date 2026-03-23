import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { updateStatus } from "../store/bugsSlice";
import "./BugDetailPage.css";

interface BugDetail {
  id: number;
  title: string;
  description: string;
  reproductionSteps: string;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  reporterName: string;
  assigneeName: string | null;
  attachments: {
    id: number;
    fileName: string;
    fileSize: number;
    filePath: string;
    uploadedAt: string;
  }[];
}

const severityColor: Record<string, string> = {
  Low: "#4ade80",
  Medium: "#fb923c",
  High: "#f87171",
};

const statusColor: Record<string, string> = {
  Open: "#60a5fa",
  InProgress: "#a5b4fc",
  Resolved: "#4ade80",
  Closed: "#888",
};

const BugDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isDeveloper = user?.role === "Developer";

  const [bug, setBug] = useState<BugDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/bugs/${id}`)
      .then(({ data }) => setBug(data.data))
      .catch(() => setError("Bug not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!bug) return;
    await dispatch(updateStatus({ id: bug.id, status }));
    setBug({ ...bug, status });
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">Loading...</div>;
  }

  if (error || !bug) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  const handleDownload = async (attachmentId: number, fileName: string) => {
  try {
    const response = await api.get(`/bugs/attachments/download/${attachmentId}`, {
      responseType: 'blob', // important — tells axios to treat response as a file
    });

    // Create a temporary link and click it to trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to download file. Please try again.');
  }
};

  return (
    <div className="bug-detail-wrapper">
      <button className="back-btn" onClick={() => navigate("/bugs")}>
        Back to Bugs
      </button>

      <div className="bug-header">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div>
            <p className="bug-number">Bug #{bug.id}</p>
            <h1 className="bug-title">{bug.title}</h1>
          </div>
          <div className="bug-badges">
            <span
              className="badge-pill"
              style={{
                background: severityColor[bug.severity] + "22",
                color: severityColor[bug.severity],
              }}
            >
              {bug.severity}
            </span>
            <span
              className="badge-pill"
              style={{
                background: statusColor[bug.status] + "22",
                color: statusColor[bug.status],
              }}
            >
              {bug.status}
            </span>
          </div>
        </div>
        <div className="bug-meta">
          <div className="bug-meta-item">
            <span>Reported by:</span>
            <strong>{bug.reporterName}</strong>
          </div>
          <div className="bug-meta-item">
            <span>Assigned to:</span>
            <strong>{bug.assigneeName ?? "Unassigned"}</strong>
          </div>
          <div className="bug-meta-item">
            <span>Created:</span>
            <strong>{new Date(bug.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>

      <div className="card border detail-card">
        <div className="card-body">
          <h6 className="detail-card-title">Description</h6>
          <p className="detail-card-content">{bug.description}</p>
        </div>
      </div>

      <div className="card border detail-card">
        <div className="card-body">
          <h6 className="detail-card-title">Reproduction Steps</h6>
          <p className="detail-card-content" style={{ whiteSpace: "pre-line" }}>
            {bug.reproductionSteps}
          </p>
        </div>
      </div>

      {bug.attachments.length > 0 && (
        <div className="card border detail-card">
          <div className="card-body">
            <h6 className="detail-card-title">
              Attachments ({bug.attachments.length})
            </h6>
            {bug.attachments.map((a) => (
              <div key={a.id} className="attachment-item">
                <div className="d-flex align-items-center">
                  <span className="attachment-name">{a.fileName}</span>
                  <span className="attachment-size">
                    ({(a.fileSize / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button className="attachment-download" onClick={() => handleDownload(a.id, a.fileName)}>
  Download
</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isDeveloper && bug.assigneeName && (
        <div className="card border detail-card">
          <div className="card-body">
            <h6 className="detail-card-title">Update Status</h6>
            <div className="status-actions">
              {["Open", "InProgress", "Resolved", "Closed"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`status-btn ${bug.status === s ? "active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugDetailPage;
