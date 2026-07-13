import { Link } from "react-router-dom";
import SubscribeSection from "../Subscription/SubscribeSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCartShopping,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => (
  <>
    <SubscribeSection />
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              to="/"
              className="logo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <FontAwesomeIcon icon={faGraduationCap} size="lg" />
              <span className="logo-text">EduVerse</span>
            </Link>
            <div className="footer-social">
              {["f", "ig", "tw", "in"].map((s, i) => (
                <a key={i} href="#" aria-label={s}>
                  {["ƒ", "◎", "✦", "in"][i]}
                </a>
              ))}
            </div>
            <p
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              © 2026 EduVerse.co
              <br />
              EduVerse is a registered trademark of EduVerse.co
            </p>
          </div>

          <div className="footer-col">
            <h4>Courses</h4>
            <ul>
              {[
                "Classroom courses",
                "Virtual classroom courses",
                "E-learning courses",
                "Video Courses",
                "Offline Courses",
              ].map((l) => (
                <li key={l}>
                  <Link to="/courses">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              {[
                "Learners",
                "Partners",
                "Developers",
                "Transactions",
                "Blog",
                "Teaching Center",
              ].map((l) => (
                <li key={l}>
                  <Link to="#">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Quick links</h4>
            <ul>
              {[
                "Home",
                "Professional Education",
                "Courses",
                "Admissions",
                "Testimonial",
                "Programs",
              ].map((l, i) => (
                <li key={l}>
                  <Link
                    to={
                      [
                        "/",
                        "/courses",
                        "/courses",
                        "/courses",
                        "/mentors",
                        "/courses",
                      ][i]
                    }
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>More</h4>
            <ul>
              {[
                "Press",
                "Investors",
                "Terms",
                "Privacy",
                "Help",
                "Contact",
              ].map((l) => (
                <li key={l}>
                  <Link to="#">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </>
);

export default Footer;
