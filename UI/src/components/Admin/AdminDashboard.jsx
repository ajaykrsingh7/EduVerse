import { useState, useEffect } from "react";
import { adminAPI } from "../../services/adminApi";
import { AdminTable, AvatarCell } from "./AdminComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserGraduate,
  faChalkboardTeacher,
  faBookOpen,
  faBook,
  faClipboardCheck,
  faEnvelopeOpenText,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const StatCard = ({ icon, value, label, change, color, bg }) => (
  <div
    className="admin-stat-card"
    style={{ "--card-color": color, "--card-bg": bg }}
  >
    <div className="admin-stat-card__icon">
      <FontAwesomeIcon icon={icon} />
    </div>

    <div className="admin-stat-card__value">
      {value?.toLocaleString() ?? "—"}
    </div>

    <div className="admin-stat-card__label">{label}</div>

    {change !== undefined && (
      <span
        className={`admin-stat-card__change admin-stat-card__change--${
          change >= 0 ? "up" : "down"
        }`}
      >
        {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
      </span>
    )}
  </div>
);

const BarChart = ({ data, valueKey, labelKey, color = "" }) => {
  if (!data?.length)
    return (
      <div
        style={{
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ad-muted)",
          fontSize: 13,
        }}
      >
        No chart data yet
      </div>
    );
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-chart__bar-wrap">
          <div
            className={`bar-chart__bar ${color}`}
            style={{ height: `${Math.max(4, (d[valueKey] / max) * 160)}px` }}
            title={`${d[labelKey]}: ${d[valueKey]}`}
          />
          <span className="bar-chart__label">
            {String(d[labelKey]).slice(-5)}
          </span>
        </div>
      ))}
    </div>
  );
};

const RECENT_ENROLL_COLS = [
  {
    key: "student",
    label: "Student",
    render: (v, r) => <AvatarCell name={v} email={r.email} />,
  },
  {
    key: "course",
    label: "Course",
    render: (v) => <span className="td-primary">{v}</span>,
  },
  {
    key: "price",
    label: "Price",
    render: (v) => (
      <span style={{ color: "var(--ad-success)", fontWeight: 700 }}>${v}</span>
    ),
  },
  {
    key: "enrolled_at",
    label: "Date",
    render: (v) => (
      <span className="td-muted">{new Date(v).toLocaleDateString()}</span>
    ),
  },
];

const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

const STAT_CARDS = [
  { icon: faUsers, label: "Total Users", value: stats.totalUsers },
  { icon: faUserGraduate, label: "Students", value: stats.totalStudents },
  { icon: faChalkboardTeacher, label: "Active Mentors", value: stats.totalMentors },
  { icon: faBookOpen, label: "Published Courses", value: stats.totalCourses },
  { icon: faBook, label: "Books", value: stats.totalBooks },
  { icon: faClipboardCheck, label: "Enrollments", value: stats.totalEnrollments },
  { icon: faEnvelopeOpenText, label: "Subscribers", value: stats.newsletterSubscribers },
  { icon: faClipboardList, label: "Pending Apps", value: stats.pendingApplications },
];


{STAT_CARDS.map((card) => (
  <div key={card.label} className="stat-card">
    <div className="stat-card__icon">
      <FontAwesomeIcon icon={card.icon} />
    </div>
    <div className="stat-card__content">
      <p>{card.label}</p>
      <h3>{card.value}</h3>
    </div>
  </div>
))}


  const categories = [
    {
      label: "High School",
      value: Math.round((stats.totalCourses || 0) * 0.4),
      color: "#6C63FF",
    },
    {
      label: "Kindergarten",
      value: Math.round((stats.totalCourses || 0) * 0.25),
      color: "#3498DB",
    },
    {
      label: "College",
      value: Math.round((stats.totalCourses || 0) * 0.2),
      color: "#2ECC71",
    },
    {
      label: "Computer",
      value: Math.round((stats.totalCourses || 0) * 0.15),
      color: "#F39C12",
    },
  ];
  const maxCat = Math.max(...categories.map((c) => c.value), 1);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(108,99,255,0.3)",
              borderTopColor: "#6C63FF",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--ad-muted)" }}>Loading dashboard…</p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Stat cards */}
      <div className="admin-stats-grid">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="admin-charts-grid">
        {/* User growth */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__title">User Growth</div>
              <div className="admin-card__subtitle">
                New registrations per month
              </div>
            </div>
            <span className="admin-card__badge">Last 6 months</span>
          </div>
          <BarChart
            data={data?.monthly || []}
            valueKey="users"
            labelKey="month"
          />
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid var(--ad-border)",
              paddingTop: 16,
            }}
          >
            <div
              className="admin-card__title"
              style={{ fontSize: 13, marginBottom: 12 }}
            >
              Enrollment Activity
            </div>
            <BarChart
              data={data?.monthlyEnroll || []}
              valueKey="enrollments"
              labelKey="month"
              color="bar-chart__bar--secondary"
            />
          </div>
        </div>

        {/* Course distribution */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__title">Course Categories</div>
              <div className="admin-card__subtitle">Distribution breakdown</div>
            </div>
          </div>
          <div className="ring-stats">
            {categories.map((cat) => (
              <div key={cat.label} className="ring-stat-row">
                <span className="ring-stat-label">{cat.label}</span>
                <div className="ring-stat-bar">
                  <div
                    className="ring-stat-fill"
                    style={{
                      width: `${(cat.value / maxCat) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
                <span className="ring-stat-value">{cat.value}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid var(--ad-border)",
              paddingTop: 20,
            }}
          >
            <div
              className="admin-card__title"
              style={{ fontSize: 13, marginBottom: 14 }}
            >
              Quick Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* {[
                { label: "+ Add New Course", color: "#6C63FF" },
                { label: "+ Add New Book", color: "#3498DB" },
                { label: "👥 View Users", color: "#2ECC71" },
                { label: "📋 Review Apps", color: "#F39C12" },
              ].map((a) => (
                <div
                  key={a.label}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 8,
                    background: "var(--ad-surface2)",
                    border: "1px solid var(--ad-border)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: a.color,
                    cursor: "pointer",
                    transition: "var(--ad-transition)",
                  }}
                >
                  {a.label}
                </div>
              ))} */}

              {[
                {
                  label: "+ Add New Course",
                  page: "courses",
                  color: "#6C63FF",
                },
                { label: "+ Add New Book", page: "books", color: "#3498DB" },
                { label: "👥 Manage Users", page: "users", color: "#2ECC71" },
                {
                  label: "📋 Review Apps",
                  page: "applications",
                  color: "#F39C12",
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => onNavigate?.(a.page)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 8,
                    width: "100%",
                    textAlign: "left",
                    background: "var(--ad-surface2)",
                    border: "1px solid var(--ad-border)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: a.color,
                    cursor: "pointer",
                    transition: "var(--ad-transition)",
                    fontFamily: "var(--ad-font)",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">Recent Enrollments</div>
            <div className="admin-card__subtitle">
              Latest student course purchases
            </div>
          </div>
        </div>
        <AdminTable
          columns={RECENT_ENROLL_COLS}
          data={data?.recentEnrollments || []}
          loading={false}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
