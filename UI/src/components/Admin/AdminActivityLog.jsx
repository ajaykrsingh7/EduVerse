import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGraduationCap,
  faChalkboardUser,
  faBook,
  faClipboardCheck,
  faLock
} from "@fortawesome/free-solid-svg-icons";

// All Activity Set to Constanst (Hard Coded) -- Not Sync With DB Yet.
const ACTIVITY_TYPES = {
  user_created: {
    color: "#2ECC71",
    icon: <FontAwesomeIcon icon={faUser} />,
    label: "User Registered"
  },

  course_enrolled: {
    color: "#6C63FF",
    icon: <FontAwesomeIcon icon={faGraduationCap} />,
    label: "Course Enrollment"
  },

  mentor_approved: {
    color: "#3498DB",
    icon: <FontAwesomeIcon icon={faChalkboardUser} />,
    label: "Mentor Approved"
  },

  book_created: {
    color: "#F39C12",
    icon: <FontAwesomeIcon icon={faBook} />,
    label: "Book Added"
  },

  app_reviewed: {
    color: "#E74C3C",
    icon: <FontAwesomeIcon icon={faClipboardCheck} />,
    label: "Application Reviewed"
  },

  admin_login: {
    color: "#9B59B6",
    icon: <FontAwesomeIcon icon={faLock} />,
    label: "Admin Login"
  },
};

// Generate some realistic demo entries
const generateDemoLog = () => {
  const names = [
    "Alice Wang",
    "Bob Smith",
    "Carlos M.",
    "Deepa K.",
    "Emma B.",
    "Frank L.",
  ];
  const courses = [
    "Maths Standard 3",
    "English Grammar",
    "Physics 101",
    "Computer Science",
  ];
  const entries = [];
  const now = Date.now();
  const types = Object.keys(ACTIVITY_TYPES);

  for (let i = 0; i < 40; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    const msAgo = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);

    let msg = "";
    switch (type) {
      case "user_created":
        msg = `${name} created a new account`;
        break;
      case "course_enrolled":
        msg = `${name} enrolled in "${course}"`;
        break;
      case "mentor_approved":
        msg = `${name} was approved as a mentor`;
        break;
      case "book_created":
        msg = `A new book was added to the shop`;
        break;
      case "app_reviewed":
        msg = `${name}'s instructor application was reviewed`;
        break;
      case "admin_login":
        msg = `Admin logged into the dashboard`;
        break;
    }
    entries.push({ id: i, type, msg, ts: now - msAgo });
  }
  return entries.sort((a, b) => b.ts - a.ts);
};

const TIME_FILTERS = [
  { label: "All Time", value: 0 },
  { label: "Today", value: 1 },
  { label: "This Week", value: 7 },
];

const AdminActivityLog = () => {
  const [log] = useState(generateDemoLog);
  const [typeFilter, setTypeFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(0);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const now = Date.now();
  const filtered = log.filter((e) => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (timeFilter > 0 && now - e.ts > timeFilter * 24 * 60 * 60 * 1000)
      return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const formatTime = (ts) => {
    const diff = Math.floor((now - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Type counts for summary
  const typeCounts = Object.fromEntries(
    Object.keys(ACTIVITY_TYPES).map((t) => [
      t,
      log.filter((e) => e.type === t).length,
    ]),
  );

  return (
    <div>
      {/* Mini stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {Object.entries(ACTIVITY_TYPES)
          .slice(0, 6)
          .map(([key, cfg]) => (
            <div key={key} className="ad-mini-stat">
              <span className="ad-mini-stat__icon">{cfg.icon}</span>
              <div>
                <div className="ad-mini-stat__val">{typeCounts[key] || 0}</div>
                <div className="ad-mini-stat__lbl">{cfg.label}</div>
              </div>
            </div>
          ))}
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">Activity Log</div>
            <div className="admin-card__subtitle">{filtered.length} events</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select
              className="admin-filter-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Events</option>
              {Object.entries(ACTIVITY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              className="admin-filter-select"
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(+e.target.value);
                setPage(1);
              }}
            >
              {TIME_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="ad-empty">
            <div className="ad-empty__icon">📋</div>
            <div className="ad-empty__text">
              No activity matching your filters.
            </div>
          </div>
        ) : (
          visible.map((entry) => {
            const cfg = ACTIVITY_TYPES[entry.type];
            return (
              <div key={entry.id} className="ad-log-entry">
                <div className="ad-log-dot" style={{ background: cfg.color }} />
                <div style={{ flex: 1 }}>
                  <div className="ad-log-entry__msg">
                    <span style={{ marginRight: 6 }}>{cfg.icon}</span>
                    {entry.msg}
                  </div>
                  <div className="ad-log-entry__time">
                    {formatTime(entry.ts)}
                  </div>
                </div>
                <span
                  className={`ad-pill`}
                  style={{
                    background: cfg.color + "20",
                    color: cfg.color,
                    fontSize: 10,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div
            className="ad-pagination"
            style={{
              borderTop: "1px solid var(--ad-border)",
              marginTop: 8,
              paddingTop: 16,
            }}
          >
            <span className="ad-pagination__info">
              Page {page} of {totalPages}
            </span>
            <div className="ad-pagination__btns">
              <button
                className="ad-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>
              <button
                className="ad-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLog;
