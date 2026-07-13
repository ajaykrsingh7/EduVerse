import { useState } from "react";
import { adminAPI } from "../../services/adminApi";
import { useToast, Toast } from "./AdminComponents";

const exportToCSV = (data, filename) => {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(","),
    ...data.map((row) =>
      keys
        .map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ReportCard = ({ icon, title, desc, onExport, loading }) => (
  <div
    className="admin-card"
    style={{ display: "flex", flexDirection: "column", gap: 16 }}
  >
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: "var(--ad-surface2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: 12, color: "var(--ad-muted)", lineHeight: 1.5 }}
        >
          {desc}
        </div>
      </div>
    </div>
    <button
      className="ad-btn ad-btn--ghost"
      onClick={onExport}
      disabled={loading}
      style={{ width: "100%", justifyContent: "center" }}
    >
      {loading ? (
        "Exporting…"
      ) : (
        <>
          <i className="fa-solid fa-download" style={{ marginRight: 6 }} />
          Export CSV
        </>
      )}
    </button>
  </div>
);

const AdminReports = () => {
  const [loading, setLoading] = useState({});
  const { toast, show, clear } = useToast();

  const doExport = async (key, fetchFn, filename) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const res = await fetchFn({ page: 1, limit: 10000 });
      const data = res.data || [];
      if (!data.length) {
        show("No data to export", "error");
        return;
      }
      exportToCSV(data, filename);
      show(`Exported ${data.length} rows to ${filename}.csv`);
    } catch (err) {
      show(err.message || "Export failed", "error");
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  };

  const REPORTS = [
    {
      key: "users",
      icon: <i className="fa-solid fa-users" />,
      title: "Users Report",
      desc: "Export all registered users including name, email, role, and registration date.",
      fetch: () => adminAPI.getUsers({ limit: 10000 }),
      file: "EduVerse_users",
    },
    {
      key: "courses",
      icon: <i className="fa-solid fa-book-open" />,
      title: "Courses Report",
      desc: "Export all courses with title, category, price, instructor, and publish status.",
      fetch: () => adminAPI.getCourses({ limit: 10000 }),
      file: "EduVerse_courses",
    },
    {
      key: "enrollments",
      icon: <i className="fa-solid fa-user-graduate" />,
      title: "Enrollments Report",
      desc: "Export all student enrollments with student name, course, price paid, and date.",
      fetch: () => adminAPI.getEnrollments({ limit: 10000 }),
      file: "EduVerse_enrollments",
    },
    {
      key: "mentors",
      icon: <i className="fa-solid fa-chalkboard-user" />,
      title: "Mentors Report",
      desc: "Export mentor profiles including experience, rating, course count, and approval status.",
      fetch: () => adminAPI.getMentors({ limit: 10000 }),
      file: "EduVerse_mentors",
    },
    {
      key: "books",
      icon: <i className="fa-solid fa-book" />,
      title: "Books Report",
      desc: "Export bookshop catalogue with title, author, category, price, and rating.",
      fetch: () => adminAPI.getBooks({ limit: 10000 }),
      file: "EduVerse_books",
    },
    {
      key: "newsletter",
      icon: <i className="fa-solid fa-envelope" />,
      title: "Newsletter Subscribers",
      desc: "Export all newsletter subscriber emails with subscription dates.",
      fetch: () => adminAPI.getNewsletter({ limit: 10000 }),
      file: "EduVerse_newsletter",
    },
    {
      key: "applications",
      icon: <i className="fa-solid fa-file-lines" />,
      title: "Instructor Applications",
      desc: "Export all instructor applications with status and review timestamps.",
      fetch: () => adminAPI.getApplications({ limit: 10000 }),
      file: "EduVerse_applications",
    },
  ];

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">Reports &amp; Data Export</div>
            <div className="admin-card__subtitle">
              Download any dataset as a CSV file for offline analysis
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "var(--ad-surface2)",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>
            <i className="fa-solid fa-circle-info" />
          </span>
          <span
            style={{ fontSize: 13, color: "var(--ad-muted)", lineHeight: 1.5 }}
          >
            All exports pull live data from the database. Large datasets may
            take a moment. Exports are downloaded directly to your browser.
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        {REPORTS.map((r) => (
          <ReportCard
            key={r.key}
            icon={r.icon}
            title={r.title}
            desc={r.desc}
            loading={!!loading[r.key]}
            onExport={() => doExport(r.key, r.fetch, r.file)}
          />
        ))}
      </div>
    </>
  );
};

export default AdminReports;
