import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { mentorDashAPI } from "../../services/mentorDashAPI";
import "./mentor-dash.css";
import CurriculumBuilder from "./CurriculumBuilder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";


//  Toast
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`md-toast md-toast--${type}`}>
      <i
        className={`fa-solid fa-${type === "success" ? "circle-check" : "circle-xmark"}`}
      />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--md-muted)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ×
      </button>
    </div>
  );
};

//  Shared helpers
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show, clear: () => setToast(null) };
};

const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="md-modal-overlay" onClick={onClose}>
      <div className="md-modal" onClick={(e) => e.stopPropagation()}>
        <div className="md-modal__header">
          <h3 className="md-modal__title">{title}</h3>
          <button className="md-modal__close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="md-modal__body">{children}</div>
        {footer && <div className="md-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

const Pagination = ({ page, totalPages, total, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="md-pagination">
      <span className="md-pagination__info">
        Page {page} of {totalPages} · {total} total
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="md-page-btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button
          className="md-page-btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

// NAV CONFIG
const NAV_SECTIONS = [
  {
    section: "Overview",
    items: [
      { key: "dashboard", label: "Dashboard", icon: "fa-gauge-high" },
      { key: "earnings", label: "Earnings", icon: "fa-dollar-sign" },
    ],
  },
  {
    section: "Content",
    items: [
      { key: "courses", label: "My Courses", icon: "fa-book" },
      { key: "curriculum", label: "Curriculum", icon: "fa-list-check" },
    ],
  },
  {
    section: "Community",
    items: [
      { key: "students", label: "My Students", icon: "fa-users" },
      { key: "reviews", label: "Reviews", icon: "fa-star" },
      { key: "messages", label: "Messages", icon: "fa-envelope" },
    ],
  },
  {
    section: "Settings",
    items: [
      { key: "profile", label: "Profile & Bio", icon: "fa-user-circle" },
      { key: "settings", label: "Account Settings", icon: "fa-gear" },
    ],
  },
];

// Sidebar
const MentorSidebar = ({ active, setActive, mentor, onLogout }) => (
  <aside className="md-sidebar">
    <div className="md-sidebar__logo">
      <div className="md-sidebar__logo-icon">
        <i
          className="fa-solid fa-graduation-cap"
          style={{ color: "#fff", fontSize: 18 }}
        />
      </div>
      <span className="md-sidebar__logo-text">EduVerse</span>
      <span className="md-sidebar__logo-badge">MENTOR</span>
    </div>

    {/* Profile snapshot */}
    <div className="md-sidebar__profile">
      <div className="md-sidebar__avatar">
        {mentor?.avatar ? (
          <img src={mentor.avatar} alt={mentor.full_name} />
        ) : (
          <i className="fa-solid fa-user" />
        )}
      </div>
      <div className="md-sidebar__name">{mentor?.full_name || "Mentor"}</div>
      <div className="md-sidebar__title">{mentor?.title || "Instructor"}</div>
      {mentor?.rating > 0 && (
        <div className="md-sidebar__rating">
          <i className="fa-solid fa-star" />
          {Number(mentor.rating).toFixed(1)} ({mentor.total_reviews} reviews)
        </div>
      )}
    </div>

    <nav className="md-nav">
      {NAV_SECTIONS.map((sec) => (
        <div key={sec.section}>
          <div className="md-nav__section">{sec.section}</div>
          {sec.items.map((item) => (
            <button
              key={item.key}
              className={`md-nav__item ${active === item.key ? "md-nav__item--active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              <span className="md-nav__icon">
                <i className={`fa-solid ${item.icon}`} />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>

    <div className="md-sidebar__footer">
      <button
        className="md-logout-btn"
        title="Sign Out"
        onClick={onLogout}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#ef4444";
          e.currentTarget.style.borderColor = "#ef4444";
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "";
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.background = "";
        }}
      >
        <span>
          <strong>Sign Out</strong>
        </span>
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
    </div>
  </aside>
);

// Dashboard Overview
const Overview = () => {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([mentorDashAPI.getStats(), mentorDashAPI.getEarnings()])
      .then(([s, e]) => {
        setStats(s.data);
        setEarnings(e.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(123,47,190,0.3)",
            borderTopColor: "#7B2FBE",
            borderRadius: "50%",
            animation: "mdFadeIn 0.7s linear infinite",
          }}
        />
      </div>
    );

  const STAT_CARDS = [
    {
      icon: "fa-book",
      label: "Total Courses",
      val: stats?.totalCourses,
      g: "linear-gradient(135deg,#7B2FBE,#A855F7)",
      bg: "rgba(123,47,190,0.15)",
      col: "#A855F7",
    },
    {
      icon: "fa-circle-play",
      label: "Published",
      val: stats?.publishedCourses,
      g: "linear-gradient(135deg,#3B82F6,#60A5FA)",
      bg: "rgba(59,130,246,0.15)",
      col: "#60A5FA",
    },
    {
      icon: "fa-users",
      label: "Total Students",
      val: stats?.totalStudents,
      g: "linear-gradient(135deg,#10B981,#34D399)",
      bg: "rgba(16,185,129,0.15)",
      col: "#34D399",
    },
    {
      icon: "fa-dollar-sign",
      label: "Total Revenue",
      val: `$${Number(stats?.totalRevenue || 0).toFixed(0)}`,
      g: "linear-gradient(135deg,#F59E0B,#FBBF24)",
      bg: "rgba(245,158,11,0.15)",
      col: "#FBBF24",
    },
    {
      icon: "fa-star",
      label: "Avg Rating",
      val: stats?.averageRating || "—",
      g: "linear-gradient(135deg,#EF4444,#F87171)",
      bg: "rgba(239,68,68,0.15)",
      col: "#F87171",
    },
  ];

  const maxRev = Math.max(...earnings.map((e) => e.revenue || 0), 1);
  const maxEnr = Math.max(...earnings.map((e) => e.enrollments || 0), 1);

  return (
    <div>
      {/* Stat cards */}
      <div className="md-stats-grid">
        {STAT_CARDS.map((c) => (
          <div
            key={c.label}
            className="md-stat-card"
            style={{
              "--card-g": c.g,
              "--card-bg": c.bg,
              "--card-color": c.col,
            }}
          >
            <div className="md-stat-card__icon">
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <div className="md-stat-card__val">{c.val ?? "—"}</div>
            <div className="md-stat-card__label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Earnings chart */}
        <div className="md-card">
          <div className="md-card__header">
            <div>
              <div className="md-card__title">
                <i
                  className="fa-solid fa-chart-bar"
                  style={{ marginRight: 8, color: "#A855F7" }}
                />
                Revenue & Enrollments
              </div>
              <div className="md-card__subtitle">Last 6 months</div>
            </div>
          </div>
          {earnings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--md-muted)",
              }}
            >
              <i
                className="fa-solid fa-chart-simple"
                style={{
                  fontSize: 36,
                  opacity: 0.3,
                  marginBottom: 12,
                  display: "block",
                }}
              />
              No earnings data yet
            </div>
          ) : (
            <div className="md-bar-chart">
              {earnings.map((e, i) => (
                <div key={i} className="md-bar-wrap">
                  <div
                    className="md-bar"
                    style={{
                      height: `${Math.max(4, (e.revenue / maxRev) * 140)}px`,
                    }}
                    title={`$${e.revenue}`}
                  />
                  <span className="md-bar-label">
                    {String(e.month).slice(-5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="md-card">
          <div className="md-card__header">
            <div className="md-card__title">
              <i
                className="fa-solid fa-bolt"
                style={{ marginRight: 8, color: "#F59E0B" }}
              />
              Quick Actions
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                icon: "fa-plus",
                label: "Create New Course",
                action: "courses",
                color: "#A855F7",
              },
              {
                icon: "fa-users",
                label: "View My Students",
                action: "students",
                color: "#60A5FA",
              },
              {
                icon: "fa-star",
                label: "Check Reviews",
                action: "reviews",
                color: "#F59E0B",
              },
              {
                icon: "fa-user-circle",
                label: "Update Profile",
                action: "profile",
                color: "#34D399",
              },
            ].map((a) => (
              <div
                key={a.label}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--md-surface2)",
                  border: "1px solid var(--md-border)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: a.color,
                  cursor: "pointer",
                  transition: "var(--md-transition)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <i className={`fa-solid ${a.icon}`} />
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// My Courses 
const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [showModal, setModal] = useState(false);
  const [editCourse, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const { toast, show, clear } = useToast();

  const CATS = [
    "Kindergarten",
    "High School",
    "College",
    "Computer",
    "Science",
    "Engineering",
  ];

  const load = useCallback(() => {
    setLoading(true);
    mentorDashAPI
      .getCourses({ page, limit: 10 })
      .then((res) => {
        setCourses(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ is_published: 0, language: "English", access: "Lifetime" });
    setEdit(null);
    setModal(true);
  };
  // const openEdit = (c) => {
  //   setForm({ ...c });
  //   setEdit(c);
  //   setModal(true);
  // };

  const openEdit = (c) => {
    setForm({
      title: c.title || "",
      description: c.description || "",
      category: c.category || "",
      price: c.price || "",
      thumbnail: c.thumbnail || "",
      lessons: c.lessons || "",
      language: c.language || "English",
      access: c.access || "Lifetime",
      is_published: c.is_published || 0,
    });

    setEdit(c);
    setModal(true);
  };
  const onFC = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      if (editCourse) {
        await mentorDashAPI.updateCourse(editCourse.id, form);
        show("Course updated");
      } else {
        await mentorDashAPI.createCourse(form);
        show("Course created");
      }
      setModal(false);
      load();
    } catch (err) {
      show(err.message, "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      await mentorDashAPI.togglePublish(id);
      show("Publish status toggled");
      load();
    } catch {
      show("Failed", "error");
    }
  };

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div className="md-card">
        <div className="md-card__header">
          <div>
            <div className="md-card__title">
              <i
                className="fa-solid fa-book"
                style={{ marginRight: 8, color: "#A855F7" }}
              />
              My Courses
            </div>
            <div className="md-card__subtitle">{total} total courses</div>
          </div>
          <button className="md-btn md-btn--primary" onClick={openCreate}>
            <i className="fa-solid fa-plus" /> Create Course
          </button>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "var(--md-muted)",
            }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ fontSize: 24 }}
            />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="md-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Students</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "var(--md-muted)",
                      }}
                    >
                      <i
                        className="fa-solid fa-book-open"
                        style={{
                          fontSize: 32,
                          opacity: 0.3,
                          display: "block",
                          marginBottom: 12,
                        }}
                      />
                      No courses yet. Create your first course!
                    </td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#fff",
                            fontSize: 13,
                          }}
                        >
                          {c.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--md-muted)" }}>
                          <i
                            className="fa-solid fa-film"
                            style={{ marginRight: 4 }}
                          />
                          {c.lessons} lessons
                        </div>
                      </td>
                      <td>
                        <span className="md-pill md-pill--purple">
                          {c.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>
                          ${c.price}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--md-light)" }}>
                          {c.student_count || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#F59E0B" }}>
                          <i
                            className="fa-solid fa-star"
                            style={{ marginRight: 4 }}
                          />
                          {Number(c.avg_rating || 0).toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`md-pill md-pill--dot md-pill--${c.is_published ? "success" : "warning"}`}
                          style={{ cursor: "pointer", border: "none" }}
                          onClick={() => handleToggle(c.id)}
                        >
                          {c.is_published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="md-btn md-btn--ghost md-btn--sm"
                            onClick={() => openEdit(c)}
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        title={editCourse ? "Edit Course" : "Create New Course"}
        onClose={() => setModal(false)}
        footer={
          <>
            <button
              className="md-btn md-btn--ghost"
              onClick={() => setModal(false)}
            >
              Cancel
            </button>
            <button className="md-btn md-btn--primary" onClick={handleSave}>
              <i className="fa-solid fa-floppy-disk" />{" "}
              {editCourse ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <div className="md-form-group">
          <label className="md-form-label">Course Title *</label>
          <input
            className="md-form-input"
            name="title"
            value={form.title || ""}
            onChange={onFC}
            placeholder="e.g. Advanced JavaScript"
          />
        </div>
        <div className="md-form-grid2">
          <div className="md-form-group">
            <label className="md-form-label">Category *</label>
            <select
              className="md-form-select"
              name="category"
              value={form.category || ""}
              onChange={onFC}
            >
              <option value="">Select</option>
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md-form-group">
            <label className="md-form-label">Price ($) *</label>
            <input
              className="md-form-input"
              name="price"
              type="number"
              value={form.price || ""}
              onChange={onFC}
              placeholder="49.00"
            />
          </div>
          <div className="md-form-group">
            <label className="md-form-label">Lessons</label>
            <input
              className="md-form-input"
              name="lessons"
              type="number"
              value={form.lessons || ""}
              onChange={onFC}
              placeholder="20"
            />
          </div>
          <div className="md-form-group">
            <label className="md-form-label">Language</label>
            <input
              className="md-form-input"
              name="language"
              value={form.language || "English"}
              onChange={onFC}
            />
          </div>
        </div>
        <div className="md-form-group">
          <label className="md-form-label">Description</label>
          <textarea
            className="md-form-textarea"
            name="description"
            value={form.description || ""}
            onChange={onFC}
            placeholder="What students will learn..."
          />
        </div>
        <div className="md-form-group">
          <label className="md-form-label">Thumbnail URL</label>
          <input
            className="md-form-input"
            name="thumbnail"
            value={form.thumbnail || ""}
            onChange={onFC}
            placeholder="https://images.unsplash.com/photo-... (use Unsplash URL)"
          />
        </div>
      </Modal>
    </>
  );
};

// Students 
const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    mentorDashAPI
      .getStudents({ page, limit: 15 })
      .then((res) => {
        setStudents(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="md-card">
      <div className="md-card__header">
        <div>
          <div className="md-card__title">
            <i
              className="fa-solid fa-users"
              style={{ marginRight: 8, color: "#60A5FA" }}
            />
            My Students
          </div>
          <div className="md-card__subtitle">
            {total} students enrolled in your courses
          </div>
        </div>
      </div>
      <table className="md-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Courses Enrolled</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: 40 }}>
                <i className="fa-solid fa-spinner fa-spin" />
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "var(--md-muted)",
                }}
              >
                <i
                  className="fa-solid fa-user-graduate"
                  style={{
                    fontSize: 32,
                    opacity: 0.3,
                    display: "block",
                    marginBottom: 12,
                  }}
                />
                No students yet
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="md-avatar-cell">
                    <div className="md-avatar">
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.full_name} />
                      ) : (
                        s.full_name?.[0]
                      )}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}
                      >
                        {s.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--md-muted)" }}>
                        {s.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="md-pill md-pill--purple">
                    <i className="fa-solid fa-book" /> {s.enrolled_courses}{" "}
                    course(s)
                  </span>
                </td>
                <td style={{ color: "var(--md-muted)", fontSize: 12 }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onChange={setPage}
      />
    </div>
  );
};

// Reviews 
const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    mentorDashAPI
      .getReviews({ page, limit: 15 })
      .then((res) => {
        setReviews(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const stars = (n) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fa-${i < n ? "solid" : "regular"} fa-star`}
        style={{ color: "#F59E0B", fontSize: 12 }}
      />
    ));

  return (
    <div className="md-card">
      <div className="md-card__header">
        <div>
          <div className="md-card__title">
            <i
              className="fa-solid fa-star"
              style={{ marginRight: 8, color: "#F59E0B" }}
            />
            Student Reviews
          </div>
          <div className="md-card__subtitle">{total} total reviews</div>
        </div>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{ fontSize: 24, color: "var(--md-muted)" }}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--md-muted)",
          }}
        >
          <i
            className="fa-regular fa-star"
            style={{
              fontSize: 40,
              opacity: 0.3,
              display: "block",
              marginBottom: 12,
            }}
          />
          No reviews yet
        </div>
      ) : (
        reviews.map((r) => (
          <div
            key={r.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--md-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div className="md-avatar" style={{ width: 36, height: 36 }}>
                {r.reviewer_avatar ? (
                  <img src={r.reviewer_avatar} alt={r.reviewer} />
                ) : (
                  r.reviewer?.[0]
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>
                  {r.reviewer}
                </div>
                <div style={{ fontSize: 11, color: "var(--md-muted)" }}>
                  on "{r.course_title}"
                </div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>{stars(r.rating)}</div>
              <div style={{ fontSize: 11, color: "var(--md-muted)" }}>
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
            {r.comment && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--md-light)",
                  paddingLeft: 48,
                  lineHeight: 1.6,
                }}
              >
                {r.comment}
              </p>
            )}
          </div>
        ))
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        onChange={setPage}
      />
    </div>
  );
};

// Profile Settings 
const ProfileSettings = ({ mentor, onSaved }) => {
  const { refreshUser, updateUserLocally } = useAuth();
  const [form, setForm] = useState({
    fullName: mentor?.full_name || "",
    title: mentor?.title || "",
    bio: mentor?.bio || "",
    experience: mentor?.experience || 0,
    category: mentor?.category || "All",
    languages: mentor?.languages || "English",
    avatar: mentor?.avatar || "",
    facebook: mentor?.facebook || "",
    instagram: mentor?.instagram || "",
    twitter: mentor?.twitter || "",
    linkedin: mentor?.linkedin || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast, show, clear } = useToast();

  const onFC = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await mentorDashAPI.updateProfile(form);

      // Sync avatar to navbar immediately
      if (form.avatar) {
        updateUserLocally({ avatar: form.avatar, full_name: form.fullName });
      } else {
        updateUserLocally({ full_name: form.fullName });
      }
      await refreshUser();

      show("Profile updated successfully");
      onSaved?.();
    } catch (err) {
      show(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const CATS = [
    "All",
    "Kindergarten",
    "High School",
    "College",
    "Computer",
    "Science",
    "Engineering",
  ];

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Profile photo section */}
        <div className="md-card" style={{ gridColumn: "1/-1" }}>
          <div className="md-card__header">
            <div className="md-card__title">
              <i
                className="fa-solid fa-image-portrait"
                style={{ marginRight: 8, color: "#A855F7" }}
              />
              Profile Photo
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid rgba(123,47,190,0.4)",
                background: "var(--md-primary-g)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {mentor?.avatar ? (
                <img
                  src={mentor.avatar}
                  alt="profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <i className="fa-solid fa-user" />
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--md-muted)",
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}
              >
                <i
                  className="fa-solid fa-circle-info"
                  style={{ marginRight: 6, color: "#60A5FA" }}
                />
                Use an Unsplash URL for your profile photo. Example:{" "}
                <code
                  style={{
                    background: "var(--md-surface2)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                >
                  https://images.unsplash.com/photo-xxx?w=200
                </code>
              </p>
              <div className="md-form-group" style={{ marginBottom: 0 }}>
                <input
                  className="md-form-input"
                  name="avatar"
                  placeholder="https://images.unsplash.com/photo-... "
                  onChange={onFC}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="md-card">
          <div className="md-card__header">
            <div className="md-card__title">
              <i
                className="fa-solid fa-user-pen"
                style={{ marginRight: 8, color: "#60A5FA" }}
              />
              Personal Information
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="md-form-group">
              <label className="md-form-label">
                <i className="fa-solid fa-user" style={{ marginRight: 6 }} />
                Full Name
              </label>
              <input
                className="md-form-input"
                name="fullName"
                value={form.fullName}
                onChange={onFC}
              />
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-briefcase"
                  style={{ marginRight: 6 }}
                />
                Professional Title
              </label>
              <input
                className="md-form-input"
                name="title"
                value={form.title}
                onChange={onFC}
                placeholder="e.g. Senior Developer & Educator"
              />
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-layer-group"
                  style={{ marginRight: 6 }}
                />
                Teaching Category
              </label>
              <select
                className="md-form-select"
                name="category"
                value={form.category}
                onChange={onFC}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i className="fa-solid fa-clock" style={{ marginRight: 6 }} />
                Years of Experience
              </label>
              <input
                className="md-form-input"
                name="experience"
                type="number"
                min="0"
                value={form.experience}
                onChange={onFC}
              />
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-language"
                  style={{ marginRight: 6 }}
                />
                Languages
              </label>
              <input
                className="md-form-input"
                name="languages"
                value={form.languages}
                onChange={onFC}
                placeholder="English, Hindi"
              />
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-align-left"
                  style={{ marginRight: 6 }}
                />
                Bio
              </label>
              <textarea
                className="md-form-textarea"
                name="bio"
                value={form.bio}
                onChange={onFC}
                rows={4}
                placeholder="Tell students about your background and teaching style..."
              />
            </div>
            <button
              type="submit"
              className="md-btn md-btn--primary"
              disabled={saving}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <i className="fa-solid fa-floppy-disk" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        {/* Social links */}
        <div className="md-card">
          <div className="md-card__header">
            <div className="md-card__title">
              <i
                className="fa-solid fa-share-nodes"
                style={{ marginRight: 8, color: "#34D399" }}
              />
              Social Links
            </div>
          </div>
          {[
            {
              name: "facebook",
              icon: "fa-brands fa-facebook",
              label: "Facebook",
              placeholder: "facebook.com/yourpage",
            },
            {
              name: "instagram",
              icon: "fa-brands fa-instagram",
              label: "Instagram",
              placeholder: "instagram.com/yourhandle",
            },
            {
              name: "twitter",
              icon: "fa-brands fa-twitter",
              label: "Twitter/X",
              placeholder: "twitter.com/yourhandle",
            },
            {
              name: "linkedin",
              icon: "fa-brands fa-linkedin",
              label: "LinkedIn",
              placeholder: "linkedin.com/in/yourname",
            },
            // {
            //   name: "youtube",
            //   icon: "fa-brands fa-youtube",
            //   label: "YouTube",
            //   placeholder: "youtube.com/@yourchannel",
            // },
          ].map((s) => (
            <div key={s.name} className="md-form-group">
              <label className="md-form-label">
                <i className={s.icon} style={{ marginRight: 6 }} />
                {s.label}
              </label>
              <input
                className="md-form-input"
                name={s.name}
                value={form[s.name]}
                onChange={onFC}
                placeholder={s.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Messages placeholder 
const Messages = () => (
  <div className="md-card" style={{ textAlign: "center", padding: "60px 0" }}>
    <i
      className="fa-solid fa-envelope"
      style={{
        fontSize: 48,
        color: "var(--md-muted)",
        opacity: 0.3,
        display: "block",
        marginBottom: 16,
      }}
    />
    <h3 style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
      Messaging Coming Soon
    </h3>
    <p style={{ color: "var(--md-muted)", fontSize: 14 }}>
      Direct messaging between mentors and students will be available soon.
    </p>
  </div>
);

// Replace the static Curriculum placeholder with:
const CurriculumPage = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    mentorDashAPI.getCourses({ limit: 100 }).then((res) => {
      const list = res.data || [];
      setCourses(list);
      if (list.length > 0) setSelected(list[0]);
    });
  }, []);

  return (
    <div>
      {/* Course selector */}
      {courses.length > 0 && (
        <div className="md-card" style={{ marginBottom: 20 }}>
          <div className="md-card__header">
            <div className="md-card__title">
              <i
                className="fa-solid fa-book"
                style={{ marginRight: 8, color: "#A855F7" }}
              />
              Select Course to Edit Curriculum
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {courses.map((c) => (
              <button
                key={c.id}
                className={`md-btn ${selected?.id === c.id ? "md-btn--primary" : "md-btn--ghost"}`}
                onClick={() => setSelected(c)}
              >
                <i className="fa-solid fa-book-open" /> {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected ? (
        <CurriculumBuilder
          courseId={selected.id}
          courseTitle={selected.title}
        />
      ) : (
        <div
          className="md-card"
          style={{ textAlign: "center", padding: "60px 0" }}
        >
          <i
            className="fa-solid fa-book-open"
            style={{
              fontSize: 48,
              color: "var(--md-muted)",
              opacity: 0.3,
              display: "block",
              marginBottom: 16,
            }}
          />
          <h3 style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
            No courses yet
          </h3>
          <p style={{ color: "var(--md-muted)" }}>
            Create a course first from "My Courses", then build its curriculum
            here.
          </p>
        </div>
      )}
    </div>
  );
};

// Earnings Chart 
const Earnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorDashAPI
      .getEarnings()
      .then((res) => setEarnings(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const totalRev = earnings.reduce((s, e) => s + Number(e.revenue || 0), 0);
  const totalEnr = earnings.reduce((s, e) => s + Number(e.enrollments || 0), 0);
  const maxRev = Math.max(...earnings.map((e) => Number(e.revenue || 0)), 1);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            icon: "fa-dollar-sign",
            label: "Total Revenue",
            val: `$${totalRev.toFixed(2)}`,
            g: "linear-gradient(135deg,#10B981,#34D399)",
            bg: "rgba(16,185,129,0.15)",
            col: "#34D399",
          },
          {
            icon: "fa-users",
            label: "Total Enrollments",
            val: totalEnr,
            g: "linear-gradient(135deg,#7B2FBE,#A855F7)",
            bg: "rgba(123,47,190,0.15)",
            col: "#A855F7",
          },
          {
            icon: "fa-chart-line",
            label: "Avg Monthly",
            val: `$${earnings.length ? (totalRev / earnings.length).toFixed(0) : 0}`,
            g: "linear-gradient(135deg,#F59E0B,#FBBF24)",
            bg: "rgba(245,158,11,0.15)",
            col: "#FBBF24",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="md-stat-card"
            style={{
              "--card-g": c.g,
              "--card-bg": c.bg,
              "--card-color": c.col,
            }}
          >
            <div className="md-stat-card__icon">
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <div className="md-stat-card__val">{c.val}</div>
            <div className="md-stat-card__label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="md-card">
        <div className="md-card__header">
          <div className="md-card__title">
            <i
              className="fa-solid fa-chart-bar"
              style={{ marginRight: 8, color: "#A855F7" }}
            />
            Monthly Revenue (Last 6 Months)
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <i className="fa-solid fa-spinner fa-spin" />
          </div>
        ) : earnings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--md-muted)",
            }}
          >
            <i
              className="fa-solid fa-chart-simple"
              style={{
                fontSize: 36,
                opacity: 0.3,
                display: "block",
                marginBottom: 12,
              }}
            />
            No earnings data yet. Publish a course to start earning.
          </div>
        ) : (
          <div className="md-bar-chart">
            {earnings.map((e, i) => (
              <div key={i} className="md-bar-wrap">
                <div
                  className="md-bar md-bar--rev"
                  style={{
                    height: `${Math.max(4, (Number(e.revenue) / maxRev) * 140)}px`,
                  }}
                  title={`$${e.revenue} — ${e.enrollments} enrollments`}
                />
                <span className="md-bar-label">
                  {String(e.month).slice(-5)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Monthly breakdown table */}
        {earnings.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <table className="md-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Enrollments</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...earnings].reverse().map((e, i) => (
                  <tr key={i}>
                    <td style={{ color: "#fff", fontWeight: 600 }}>
                      {e.month}
                    </td>
                    <td>
                      <span className="md-pill md-pill--purple">
                        {e.enrollments}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>
                        ${Number(e.revenue).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Account Settings 
const AccountSettings = () => {
  const { toast, show, clear } = useToast();

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />
      <div className="md-card">
        <div className="md-card__header">
          <div className="md-card__title">
            <i
              className="fa-solid fa-gear"
              style={{ marginRight: 8, color: "#A855F7" }}
            />
            Account Settings
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fa-solid fa-lock" style={{ color: "#60A5FA" }} />
            Change Password
          </h4>
          <div className="md-form-grid2">
            <div className="md-form-group">
              <label className="md-form-label">New Password</label>
              <input
                className="md-form-input"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="md-form-group">
              <label className="md-form-label">Confirm Password</label>
              <input
                className="md-form-input"
                type="password"
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <button
            className="md-btn md-btn--primary"
            onClick={() => show("Password updated!")}
          >
            <i className="fa-solid fa-key" /> Update Password
          </button>
        </div>

        <div
          style={{ borderTop: "1px solid var(--md-border)", paddingTop: 24 }}
        >
          <h4
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fa-solid fa-bell" style={{ color: "#F59E0B" }} />
            Notification Preferences
          </h4>
          {[
            {
              label: "New student enrollment",
              desc: "Notify when someone enrolls in your course",
            },
            {
              label: "New review received",
              desc: "Notify when a student leaves a review",
            },
            {
              label: "Monthly earnings report",
              desc: "Receive monthly earnings summary via email",
            },
            {
              label: "EduVerse platform updates",
              desc: "News about new features and policies",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--md-light)",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--md-muted)",
                    marginTop: 2,
                  }}
                >
                  {item.desc}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: "var(--md-primary-g)",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 3,
                    top: 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Master MentorDashboard component 
const PAGE_TITLES = {
  dashboard: "Dashboard",
  earnings: "Earnings & Revenue",
  courses: "My Courses",
  curriculum: "Curriculum Builder",
  students: "My Students",
  reviews: "Student Reviews",
  messages: "Messages",
  profile: "Profile & Bio",
  settings: "Account Settings",
};

const MentorDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "mentor")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === "mentor") {
      mentorDashAPI
        .getProfile()
        .then((res) => setMentor(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading) return null;
  if (!user || user.role !== "mentor") return null;

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return <Overview />;
      case "earnings":
        return <Earnings />;
      case "courses":
        return <MyCourses />;
      case "curriculum":
        return <CurriculumPage />;
      case "students":
        return <MyStudents />;
      case "reviews":
        return <MyReviews />;
      case "messages":
        return <Messages />;
      case "profile":
        return (
          <ProfileSettings
            mentor={mentor}
            onSaved={() =>
              mentorDashAPI.getProfile().then((r) => setMentor(r.data))
            }
          />
        );
      case "settings":
        return <AccountSettings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="mentor-root">
      <MentorSidebar
        active={active}
        setActive={setActive}
        mentor={mentor}
        onLogout={handleLogout}
      />
      <div className="md-main">
        <header className="md-header">
          <h1 className="md-header__title">
            <i
              className="fa-solid fa-chalkboard-user"
              style={{ marginRight: 10, color: "#A855F7" }}
            />
            {PAGE_TITLES[active] || "Mentor Dashboard"}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="admin-header__icon-btn"
              title="Logout"
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.borderColor = "";
                e.currentTarget.style.background = "";
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </header>
        <div className="md-content">{renderPage()}</div>
      </div>
    </div>
  );
};

export default MentorDashboard;
