import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThLarge,
  faBook,
  faBookOpen,
  faChalkboardTeacher,
  faUsers,
  faUserGraduate,
  faClipboardList,
  faEnvelope,
  faMoneyBill,
  faBell,
  faExternalLinkAlt,
  faSignOutAlt,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

/*  NAV CONFIG  */
export const NAV = [
  {
    section: "Main",
    items: [{ key: "dashboard", label: "Dashboard", icon: "⊞" }],
  },
  {
    section: "Content",
    items: [
      { key: "courses", label: "Courses", icon: "📚" },
      { key: "books", label: "Books", icon: "📖" },
      { key: "mentors", label: "Mentors", icon: "👨‍🏫" },
    ],
  },
  {
    section: "People",
    items: [
      { key: "users", label: "Users", icon: "👥" },
      { key: "enrollments", label: "Enrollments", icon: "🎓" },
      { key: "applications", label: "Applications", icon: "📋" },
    ],
  },
  {
    section: "Marketing",
    items: [
      { key: "newsletter", label: "Newsletter", icon: "✉️" },
      { key: "pricing", label: "Pricing Plans", icon: "💰" },
    ],
  },
];

/*  Sidebar  */
export const AdminSidebar = ({ active, setActive, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <div className="admin-sidebar__logo-icon">🎓</div>
        <span className="admin-sidebar__logo-text">EduVerse</span>
        <span className="admin-sidebar__logo-badge">ADMIN</span>
      </div>

      <nav className="admin-nav">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="admin-nav__section-label">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.key}
                className={`admin-nav__item ${active === item.key ? "admin-nav__item--active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                <span className="admin-nav__icon">{item.icon}</span>
                {item.label}
                {item.key === "applications" && pendingCount > 0 && (
                  <span className="admin-nav__badge">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar">
            {user?.full_name?.[0] || "A"}
          </div>
          <div>
            <div className="admin-sidebar__user-name">
              {user?.full_name || "Admin"}
            </div>
            <div className="admin-sidebar__user-role">Administrator</div>
          </div>
          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
};

/*  Header  */
export const AdminHeader = ({
  title,
  onSearch,
  searchValue,
  active,
  setActive,
  pendingCount = 0,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="admin-header">
      <h1 className="admin-header__title">{title}</h1>
      <div className="admin-header__actions">
        {onSearch && (
          <div className="admin-header__search">
            <span><i className="fa-solid fa-magnifying-glass"></i></span>
            <input
              placeholder="Search..."
              value={searchValue || ""}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        <button className="admin-header__icon-btn" title="Notifications">
          <FontAwesomeIcon icon={faBell} />
        </button>
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
  );
};

/*  Data Table  */
export const AdminTable = ({ columns, data, loading }) => {
  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "48px" }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(108,99,255,0.3)",
            borderTopColor: "#6C63FF",
            borderRadius: "50%",
            animation: "adFadeIn 0.7s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--ad-muted)",
                }}
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row, i)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* Pagination  */
export const AdminPagination = ({ page, totalPages, total, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="ad-pagination">
      <span className="ad-pagination__info">
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="ad-pagination__btns">
        <button
          className="ad-page-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              className={`ad-page-btn ${p === page ? "ad-page-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          );
        })}
        <button
          className="ad-page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
};

/*  Modal  */
export const AdminModal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="ad-modal-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__header">
          <h3 className="ad-modal__title">{title}</h3>
          <button className="ad-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="ad-modal__body">{children}</div>
        {footer && <div className="ad-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

/*  Toast  */
export const Toast = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  return (
    <div className={`ad-toast ad-toast--${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--ad-muted)",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        ×
      </button>
    </div>
  );
};

/*  Confirm dialog  */
export const ConfirmModal = ({ open, message, onConfirm, onCancel }) => (
  <AdminModal
    open={open}
    title="Confirm Action"
    onClose={onCancel}
    footer={
      <>
        <button className="ad-btn ad-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="ad-btn ad-btn--danger" onClick={onConfirm}>
          Confirm
        </button>
      </>
    }
  >
    <p style={{ color: "var(--ad-light)", fontSize: 14 }}>
      {message || "Are you sure you want to proceed?"}
    </p>
  </AdminModal>
);

/*  useToast hook  */
export const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show, clear: () => setToast(null) };
};

/*  User avatar cell helper  */
export const AvatarCell = ({ name, email, avatar }) => (
  <div className="ad-user-cell">
    <div className="ad-avatar" style={avatar ? {} : {}}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        name?.[0]?.toUpperCase()
      )}
    </div>
    <div>
      <div className="ad-user-cell__name">{name}</div>
      {email && <div className="ad-user-cell__email">{email}</div>}
    </div>
  </div>
);
