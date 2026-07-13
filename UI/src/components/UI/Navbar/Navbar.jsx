import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import CartDrawer from "../Cart/CartDrawer";
import { NAV_ITEMS } from "../../../constants/index";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCartShopping,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const EduVerseLogo = () => (
  <Link to="/" className="logo">
    <FontAwesomeIcon icon={faGraduationCap} size="lg" />
    <span className="logo-text">EduVerse</span>
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [cartCount] = useState(0);
  const { items } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <EduVerseLogo />

        {/* Desktop Nav */}
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.label}
              className={item.hasDropdown ? "has-dropdown" : ""}
            >
              <Link to={item.href} className="nav-link">
                {item.label}
                {item.hasDropdown && <span className="dropdown-arrow">▾</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="nav-actions">
          {/* <Link to="/shop" className="cart-btn"> */}
          <button onClick={() => setCartOpen(true)} className="cart-btn">
            <span className="cart-icon">
              <FontAwesomeIcon icon={faCartShopping} />
            </span>
            {/* <span className="cart-label">Cart ({cartCount})</span> */}
            <span className="cart-label">Cart ({items.length})</span>
          </button>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn">
      {/* Show avatar image if available, else initial */}
      {user.avatar
        ? (
          <img
            src={user.avatar}
            alt={user.full_name}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          />
        )
        : (
          <span className="user-avatar">{user.full_name?.[0]?.toUpperCase() || 'U'}</span>
        )
      }
      <span className="user-name">{user.full_name?.split(' ')[0]}</span>
      <span>▾</span>
    </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <i className="fa-solid fa-user" style={{ marginRight: 8 }} />{" "}
                  My Profile
                </Link>

                <Link to="/my-learning" className="dropdown-item">
                  <i
                    className="fa-solid fa-book-open-reader"
                    style={{ marginRight: 8 }}
                  />{" "}
                  My Learning
                </Link>
                {/* <Link to="/courses/my-enrollments" className="dropdown-item">
                  My Courses
                </Link> */}

                {user.role === "mentor" && (
                  <Link to="/mentor" className="dropdown-item">
                    <i
                      className="fa-solid fa-chalkboard-user"
                      style={{ marginRight: 8 }}
                    />{" "}
                    Mentor Dashboard
                  </Link>
                )}

                {/* {user.role === "admin" && (
                  <Link to="/admin" className="dropdown-item">
                    Admin
                  </Link>
                )} */}

                {user.role === "admin" && (
                  <Link to="/admin" className="dropdown-item">
                    <i
                      className="fa-solid fa-shield-halved"
                      style={{ marginRight: 8 }}
                    />{" "}
                    Admin Panel
                  </Link>
                )}
                <div
                  style={{
                    height: 1,
                    background: "var(--border-light)",
                    margin: "4px 0",
                  }}
                />
                <button
                  className="dropdown-item dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <i
                    className="fa-solid fa-right-from-bracket"
                    style={{ marginRight: 8 }}
                  />{" "}
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="my-account-btn">
              <span className="account-icon">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <span>My Account</span>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMobileOpen((o) => !o)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button className="mobile-link" onClick={handleLogout}>
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              My Account
            </Link>
          )}
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
};

export default Navbar;
