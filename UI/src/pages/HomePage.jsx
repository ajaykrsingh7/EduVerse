import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { coursesAPI } from "../../src/services/api";
import { CourseCard } from "../components/UI/Cards/Cards";
import { Spinner, Tabs } from "../components/Base";
import Button from "../components/UI/Button/Button";
import "./Home.css";
import heroImg from "../assets/hero.png";
import videocallImg from "../assets/Video call.png";
import ctaImg from "../assets/cta.png";
import mentorImg from "../assets/mentor.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
  faUser,
  faVolumeHigh,
  faChalkboardUser,
  faCirclePlay,
  faBookOpen,
  faGraduationCap,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

const STANDARD_TABS = [
  { label: "Kindergarten", value: "Kindergarten" },
  { label: "High School", value: "High School" },
  { label: "College", value: "College" },
];

const STANDARDS = [
  {
    num: "1",
    label: "Standard One",
    desc: "Foundation standard reflecting 7 important concepts.",
  },
  {
    num: "2",
    label: "Standard Two",
    desc: "Builds on the foundations of Standard 1 and includes requirements.",
  },
  {
    num: "3",
    label: "Standard Three",
    desc: "Standard 3 of the Aged Care Quality Standards.",
  },
  {
    num: "4",
    label: "Standard Four",
    desc: "Standard 4 of the Aged Care Quality Standards.",
  },
  { num: "5", label: "Standard Five", desc: "Standard 5 Learning Resources." },
  {
    num: "6",
    label: "Standard Six",
    desc: "Standard 6 requires an organisation to resolve complaints.",
  },
  {
    num: "7",
    label: "Standard Seven",
    desc: "Standard 7 and 8 Case Management Standards.",
  },
  {
    num: "8",
    label: "Standard Eight",
    desc: "Course from NCERT solutions help students to understand.",
  },
];

const STD_COLORS = [
  "#F59E0B",
  "#1A1A2E",
  "#21C55D",
  "#1A1A2E",
  "#7B2FBE",
  "#F04B36",
  "#F59E0B",
  "#F04B36",
];

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("High School");
  const [searchCat, setSearchCat] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    coursesAPI
      .getAll({ category: activeTab, limit: 15 })
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses${searchCat ? `?category=${searchCat}` : ""}`);
  };

  const badgeGreen = {
    marginLeft: "10px",
    fontSize: "10px",
    background: "#22c55e",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "700",
  };

  const badgeBlue = {
    ...badgeGreen,
    background: "#3b82f6",
  };

  const badgeOrange = {
    ...badgeGreen,
    background: "#f59e0b",
  };
  return (
    <div className="home-page">
      {/*  Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-tag">Never Stop Learning</span>
            <h1 className="hero-heading">
              Grow up your skills
              <br />
              by online courses
              <br />
              <span className="hero-highlight">with EduVerse</span>
            </h1>
            <p className="hero-desc">
              EduVerse is a global training platform that connects you with the
              highest quality of learning courses. Work at the place on your own
              terms.
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <select
                className="hero-select"
                value={searchCat}
                onChange={(e) => setSearchCat(e.target.value)}
              >
                <option value="">Category</option>
                {[
                  "Kindergarten",
                  "High School",
                  "College",
                  "Computer",
                  "Science",
                  "Engineering",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input className="hero-input" placeholder="Class, subject..." />
              <button className="hero-search-btn" type="submit">
                <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" /> Search
              </button>
            </form>
          </div>

          <div className="hero-image">
            <img src={heroImg} alt="heroImg" />
          </div>
        </div>
      </section>

      {/*  Features strip  */}
      <section
        style={{
          overflow: "hidden",
          background: "linear-gradient(90deg, #282728, #4a444a)",
          height: "64px",
          display: "flex",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "0 10px",
        }}
      >
        <marquee
          behavior="scroll"
          direction="left"
          scrollamount="10"
          onMouseEnter={(e) => e.target.stop()}
          onMouseLeave={(e) => e.target.start()}
          style={{
            color: "#e5e7eb",
            fontSize: "16px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {/* ITEM */}
          <span
            style={{
              marginRight: "60px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faBookOpen}
              style={{ marginRight: "10px", color: "#22c55e" }}
            />
            New Book Arrivals
            <span style={badgeGreen}>NEW</span>
          </span>

          <span
            style={{
              marginRight: "60px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faGraduationCap}
              style={{ marginRight: "10px", color: "#3b82f6" }}
            />
            New Courses Available
            <span style={badgeBlue}>HOT</span>
          </span>

          <span
            style={{
              marginRight: "60px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faTags}
              style={{ marginRight: "10px", color: "#f59e0b" }}
            />
            Up to 50% Discount
            <span style={badgeOrange}>SALE</span>
          </span>

          <span
            style={{
              marginRight: "60px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faCirclePlay}
              style={{ marginRight: "10px", color: "#ec4899" }}
            />
            New Recorded Classes Added
          </span>

          <span
            style={{
              marginRight: "60px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faChalkboardUser}
              style={{ marginRight: "10px", color: "#06b6d4" }}
            />
            Live Classes Ongoing
          </span>
        </marquee>
      </section>

      {/*  Video section  */}
      {/* <section className="section video-section">
        <div className="container">
          <div className="section-header">
            <h2>
              High quality video, audio
              <br />
              &amp; live classes
            </h2>
            <p>
              High definition video is easy to spot, but a wider definition of
              quality includes the high quality of streaming and live lessons.
              Which means that each session you will access to up to 4K video
              streaming quality.
            </p>
            <div className="video-preview">
              <img src={videocallImg} alt="heroImg" />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/courses")}
            >
              Visit Courses
            </Button>
          </div>
        </div>
      </section> */}

      <section className="section video-section">
        <div className="container">
          <div className="section-header">
            <h2>
              High quality video, audio
              <br />
              &amp; live classes
            </h2>

            <p>
              High definition video is easy to spot, but a wider definition of
              quality includes the high quality of streaming and live lessons.
              Which means that each session you will access to up to 4K video
              streaming quality.
            </p>

            <div className="video-preview">
              <iframe
                width="100%"
                height="500"
                src="https://www.youtube.com/embed/hKB-YGF14SY?autoplay=1&mute=1&loop=1&playlist=hKB-YGF14SY"
                title="CodeWithHarry JavaScript Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/courses")}
            >
              Visit Courses
            </Button>
          </div>
        </div>
      </section>

      {/*  Courses by standard  */}
      <section className="section bg-section">
        <div className="container">
          <div className="section-header centered">
            <h2>Qualified lessons for students</h2>
            <p>
              A student is only a member of a class that already been built for
              a system that students can come in and learn with up-to-date
              updated skills and…
            </p>
          </div>

          <div className="tabs-center">
            <Tabs
              tabs={STANDARD_TABS}
              active={activeTab}
              onChange={(v) => {
                setActiveTab(v);
                setLoading(true);
              }}
            />
          </div>

          <div className="standards-grid">
            {STANDARDS.map((s, i) => (
              <div key={s.num} className="standard-card">
                <div
                  className="standard-card__num"
                  style={{ background: STD_COLORS[i] }}
                >
                  {s.num}
                </div>
                <h4>{s.label}</h4>
                <p>{s.desc}</p>
                <Link
                  to={`/courses?category=${activeTab}&standard=${s.label}`}
                  className="standard-link"
                >
                  Class Details
                </Link>
              </div>
            ))}
          </div>

          <div className="section-cta">
            <Button variant="primary" onClick={() => navigate("/courses")}>
              For More Classes
            </Button>
          </div>
        </div>
      </section>

      {/*  College CTA  */}
      <section className="section college-cta">
        <div className="container college-cta-inner">
          <div className="college-cta-content">
            <span className="college-tag">College Level</span>
            <h2>
              Upgrade Your Skills - Shape Your Future.
              <br />
            </h2>
            <p>
              Master in-demand skills with structured courses designed for
              real-world success. Start learning today — from coding to business
              and beyond.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/courses?category=College")}
            >
              Register Now
            </Button>
          </div>
          <div className="college-cta-image">
            <img src={ctaImg} alt="ctaImg" />
          </div>
        </div>
      </section>

      {/* Recent courses */}
      <section className="section">
        <div className="container">
          <div className="section-header centered">
            <h2>Our Recent Courses</h2>
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="courses-grid">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>

        {!loading && courses.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={() =>
                navigate(`/courses${activeTab ? `?category=${activeTab}` : ""}`)
              }
              style={{
                padding: "12px 32px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "var(--font)",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                transition: "var(--transition)",
              }}
            >
              <i className="fa-solid fa-arrow-right" /> View All Courses
            </button>
          </div>
        )}
      </section>

      {/*  Become a mentor CTA  */}
      <section className="section mentor-cta">
        <div className="container mentor-cta-inner">
          <div className="mentor-cta-image">
            <img src={mentorImg} alt="ctaImg" />
          </div>

          <div className="mentor-cta-content">
            <h2>
              Want to share your knowledge?
              <br />
              Join us as Mentor
            </h2>
            <p>
              You'll teach world-class quality education. Prepare well-quality
              prep for students, achieve any goal, teach creativity, or whatever
              it is.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/become-a-mentor")}
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
