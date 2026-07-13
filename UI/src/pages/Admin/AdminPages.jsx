import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/adminApi";
import {
  AdminSidebar,
  AdminHeader,
} from "../../components/Admin/AdminComponents";
import AdminDashboard from "../../components/Admin/AdminDashboard";
import AdminUsers from "../../components/Admin/AdminUsers";
import AdminCourses from "../../components/Admin/AdminCourses";
import AdminReviews from "../../components/Admin/AdminReviews";
import AdminSettings from "../../components/Admin/AdminSettings";
import AdminActivityLog from "../../components/Admin/AdminActivityLog";
import AdminReports from "../../components/Admin/AdminReports";
import {
  AdminMentors,
  AdminBooks,
  AdminApplications,
  AdminNewsletter,
  AdminEnrollments,
  AdminPricing,
} from "../../components/Admin/AdminSections";
import "../../assets/admin.css";
import "../../assets/admin-extra.css";
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

const PAGE_TITLES = {
  dashboard: "Dashboard Overview",
  users: "User Management",
  courses: "Course Management",
  books: "Book Management",
  mentors: "Mentor Management",
  enrollments: "Enrollments",
  applications: "Instructor Applications",
  newsletter: "Newsletter Subscribers",
  pricing: "Pricing Plans",
  reviews: "Reviews & Ratings",
  activity: "Activity Log",
  reports: "Reports & Export",
  settings: "Settings",
};

// Extended NAV with new sections
const NAV_EXTENDED = [
  {
    section: "Main",
    items: [
      { key: "dashboard", label: "Dashboard", icon: faThLarge },
      { key: "activity", label: "Activity Log", icon: faClipboardList },
      { key: "reports", label: "Reports", icon: faExternalLinkAlt },
    ],
  },
  {
    section: "Content",
    items: [
      { key: "courses", label: "Courses", icon: faBook },
      { key: "books", label: "Books", icon: faBookOpen },
      { key: "mentors", label: "Mentors", icon: faChalkboardTeacher },
      { key: "reviews", label: "Reviews", icon: faBell },
      { key: "pricing", label: "Pricing Plans", icon: faMoneyBill },
    ],
  },
  {
    section: "People",
    items: [
      { key: "users", label: "Users", icon: faUsers },
      { key: "enrollments", label: "Enrollments", icon: faUserGraduate },
      {
        key: "applications",
        label: "Applications",
        icon: faClipboardList,
        hasBadge: true,
      },
      { key: "newsletter", label: "Newsletter", icon: faEnvelope },
    ],
  },
  {
    section: "System",
    items: [{ key: "settings", label: "Settings", icon: faUserShield }],
  },
];

// Override AdminSidebar to use extended nav
const ExtendedSidebar = ({ active, setActive, pendingCount }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <div className="admin-sidebar__logo-icon">
          <FontAwesomeIcon icon={faUserShield} />
        </div>
        <span className="admin-sidebar__logo-text">EduVerse</span>
        <span className="admin-sidebar__logo-badge">ADMIN</span>
      </div>

      <nav className="admin-nav">
        {NAV_EXTENDED.map((section) => (
          <div key={section.section}>
            <div className="admin-nav__section-label">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.key}
                className={`admin-nav__item ${active === item.key ? "admin-nav__item--active" : ""}`}
                onClick={() => setActive(item.key)}
              >
                <span className="admin-nav__icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                {item.label}
                {item.hasBadge && pendingCount > 0 && (
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
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
    </aside>
  );
};

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [pendingCount, setPending] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === "admin") {
      adminAPI
        .getApplications({ status: "pending", page: 1, limit: 1 })
        .then((res) => setPending(res.pagination?.total || 0))
        .catch(() => {});
    }
  }, [user, active]); 

  if (authLoading) return null;
  if (!user || user.role !== "admin") return null;

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard onNavigate={setActive} />;
      case "users":
        return <AdminUsers />;
      case "courses":
        return <AdminCourses />;
      case "books":
        return <AdminBooks />;
      case "mentors":
        return <AdminMentors />;
      case "enrollments":
        return <AdminEnrollments />;
      case "applications":
        return <AdminApplications />;
      case "newsletter":
        return <AdminNewsletter />;
      case "pricing":
        return <AdminPricing />;
      case "reviews":
        return <AdminReviews />;
      case "activity":
        return <AdminActivityLog />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-root">
      <ExtendedSidebar
        active={active}
        setActive={setActive}
        pendingCount={pendingCount}
      />
      <div className="admin-main">
        <AdminHeader title={PAGE_TITLES[active] || "Admin"} />
        <div className="admin-content">{renderPage()}</div>
      </div>
    </div>
  );
};

export default AdminPage;
