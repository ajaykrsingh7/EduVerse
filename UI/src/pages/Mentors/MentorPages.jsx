import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { mentorsAPI, coursesAPI, mentorReviewsAPI } from "../../services/api";
import { MentorCard } from "../../components/UI/Cards/Cards";
import { useAuth } from "../../context/AuthContext";
import { Stars, Spinner, Pagination, Tabs } from "../../components/Base";
import Button from "../../components/UI/Button/Button";
import { MENTOR_CATEGORIES } from "../../constants/index";
import "./Mentors.css";

/* Mentors listing  */
export const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const load = (cat, page = 1) => {
    setLoading(true);
    mentorsAPI
      .getAll({ category: cat, page, limit: 12 })
      .then((res) => {
        setMentors(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1 });
      })
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(category);
  }, [category]);

  return (
    <div>
      <div className="page-header mentors-page-header">
        <div className="container flex-between">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link> |{" "}
              <span className="active">Our Mentors</span>
            </div>
            <h1 className="mentors-page-title">
              EduVerse has the
              <br />
              qualified mentor
            </h1>
          </div>
          <div className="mentors-header-img">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y291cnNlfGVufDB8fDB8fHww"
              style={{
                width: "280px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div style={{ marginBottom: 28 }}>
          <Tabs
            tabs={MENTOR_CATEGORIES}
            active={category}
            onChange={setCategory}
          />
        </div>

        {loading ? (
          <Spinner />
        ) : mentors.length === 0 ? (
          <div className="mentors-empty">No mentors found.</div>
        ) : (
          <>
            <div className="mentors-grid">
              {mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => load(category, p)}
            />
          </>
        )}
      </div>
    </div>
  );
};

/* ── Mentor detail ────────────────────────────────────────────────────────── */
export const MentorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPag] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("about");

  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewError, setReviewError] = useState("");

  // Load mentor details + their courses in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([
      mentorsAPI.getById(id),
      coursesAPI.getAll({ mentorId: id, limit: 20 }),
    ])
      .then(([mRes, cRes]) => {
        setMentor(mRes.data);
        setCourses(cRes.data || []);
      })
      .catch(() => setMentor(null))
      .finally(() => setLoading(false));
  }, [id]);

  console.log("selected mentor", courses);
  // Load reviews when reviews tab is opened
  useEffect(() => {
    if (tab === "reviews" && mentor) {
      loadReviews(1);
    }
  }, [tab, mentor]);

  const loadReviews = (page = 1) => {
    mentorReviewsAPI
      .getByMentor(id, { page, limit: 10 })
      .then((res) => {
        setReviews(res.data || []);
        setReviewPag(res.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => setReviews([]));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!reviewForm.rating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      await mentorReviewsAPI.createReview(id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewMsg("Your review has been submitted. Thank you!");
      setReviewForm({ rating: 0, comment: "" });
      // Refresh reviews list and mentor rating
      loadReviews(1);
      mentorsAPI.getById(id).then((res) => setMentor(res.data));
    } catch (err) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "3px solid var(--primary-light)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );

  if (!mentor)
    return (
      <div
        className="container"
        style={{ padding: "80px 0", textAlign: "center" }}
      >
        <i
          className="fa-solid fa-circle-xmark"
          style={{
            fontSize: 48,
            color: "var(--text-muted)",
            display: "block",
            marginBottom: 16,
          }}
        />
        <h2 style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          Mentor not found.
        </h2>
        <button
          onClick={() => navigate("/mentors")}
          className="btn btn--primary"
        >
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} />
          Back to Mentors
        </button>
      </div>
    );

  const StarRow = ({ rating, size = 14, interactive = false }) => (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`fa-${(interactive ? hoveredStar || reviewForm.rating : Math.round(rating)) >= n ? "solid" : "regular"} fa-star`}
          style={{
            color: "var(--star, #F59E0B)",
            fontSize: size,
            cursor: interactive ? "pointer" : "default",
            transition: "transform 0.1s",
            transform:
              interactive && hoveredStar === n ? "scale(1.2)" : "scale(1)",
          }}
          onMouseEnter={() => interactive && setHoveredStar(n)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          onClick={() =>
            interactive && setReviewForm((f) => ({ ...f, rating: n }))
          }
        />
      ))}
    </span>
  );

  const TAB_LIST = [
    { key: "about", label: "About", icon: "fa-user", count: null },
    {
      key: "courses",
      label: "Courses",
      icon: "fa-book",
      count: courses.length,
    },
    {
      key: "reviews",
      label: "Reviews",
      icon: "fa-star",
      count: mentor.total_reviews || 0,
    },
  ];

  return (
    <div>
      {/* Background hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg,rgba(107,70,193,0.08),rgba(123,47,190,0.04))",
          padding: "32px 0 0",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <Link
              to="/"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <i className="fa-solid fa-house" />
              Home
            </Link>
            <span style={{ margin: "0 8px", color: "var(--text-light)" }}>
              /
            </span>
            <Link
              to="/mentors"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <i className="fa-solid fa-chalkboard-user" />
              Mentors
            </Link>
            <span style={{ margin: "0 8px", color: "var(--text-light)" }}>
              /
            </span>
            <span className="active">{mentor.full_name}</span>
          </div>

          <div className="mentor-detail-layout">
            {/* ── MAIN COLUMN ─────────────────────────────────────── */}
            <div className="mentor-detail-main">
              {/* Profile header */}
              <div className="mentor-profile-header">
                <div className="mentor-profile-photo">
                  {mentor.avatar ? (
                    <img src={mentor.avatar} alt={mentor.full_name} />
                  ) : (
                    <i
                      className="fa-solid fa-user"
                      style={{ fontSize: 36, color: "var(--primary)" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 className="mentor-profile-name">{mentor.full_name}</h1>
                  <p className="mentor-profile-title">
                    <i
                      className="fa-solid fa-briefcase"
                      style={{
                        marginRight: 6,
                        color: "var(--primary)",
                        fontSize: 12,
                      }}
                    />
                    {mentor.title || "Instructor"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      <StarRow rating={mentor.rating || 0} size={13} />
                      <strong
                        style={{ color: "var(--primary)", marginLeft: 3 }}
                      >
                        {Number(mentor.rating || 0).toFixed(1)}
                      </strong>
                      <span>({mentor.total_reviews || 0} reviews)</span>
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        background: "var(--border-light)",
                        padding: "3px 10px",
                        borderRadius: 99,
                      }}
                    >
                      <i
                        className="fa-solid fa-book"
                        style={{ marginRight: 5, color: "var(--primary)" }}
                      />
                      {courses.length} courses
                    </span>
                    {mentor.experience > 0 && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          background: "var(--border-light)",
                          padding: "3px 10px",
                          borderRadius: 99,
                        }}
                      >
                        <i
                          className="fa-solid fa-clock"
                          style={{ marginRight: 5, color: "var(--primary)" }}
                        />
                        {mentor.experience} yrs exp
                      </span>
                    )}
                  </div>
                </div>
                <button
                  style={{
                    padding: "10px 22px",
                    border: "2px solid var(--primary)",
                    background: "transparent",
                    color: "var(--primary)",
                    borderRadius: "var(--radius)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-envelope" />
                  Contact
                </button>
              </div>

              {/* Tab navigation */}
              <div className="mentor-tab-nav">
                {TAB_LIST.map((t) => (
                  <button
                    key={t.key}
                    className={`mentor-tab-btn ${tab === t.key ? "mentor-tab-btn--active" : ""}`}
                    onClick={() => setTab(t.key)}
                  >
                    <i
                      className={`fa-solid ${t.icon}`}
                      style={{ marginRight: 6 }}
                    />
                    {t.label}
                    {t.count != null && (
                      <span
                        style={{
                          background:
                            tab === t.key
                              ? "rgba(123,47,190,0.15)"
                              : "var(--border-light)",
                          color:
                            tab === t.key
                              ? "var(--primary)"
                              : "var(--text-muted)",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "1px 7px",
                          borderRadius: 99,
                          marginLeft: 6,
                        }}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── ABOUT TAB ───────────────────────────────── */}
              {tab === "about" && (
                <div className="mentor-about">
                  <h2>
                    <i
                      className="fa-solid fa-circle-info"
                      style={{ marginRight: 8, color: "var(--primary)" }}
                    />
                    About {mentor.full_name?.split(" ")[0]}
                  </h2>
                  {mentor.bio ? (
                    <p>{mentor.bio}</p>
                  ) : (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      This mentor hasn't added a bio yet.
                    </p>
                  )}

                  {mentor.certification && (
                    <div style={{ marginTop: 24 }}>
                      <h2>
                        <i
                          className="fa-solid fa-certificate"
                          style={{ marginRight: 8, color: "var(--primary)" }}
                        />
                        Certification
                      </h2>
                      <p>{mentor.certification}</p>
                    </div>
                  )}

                  {mentor.languages && (
                    <div style={{ marginTop: 24 }}>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--text-dark)",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <i
                          className="fa-solid fa-language"
                          style={{ color: "var(--primary)" }}
                        />
                        Languages
                      </h3>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {mentor.languages.split(",").map((l) => (
                          <span
                            key={l}
                            style={{
                              background: "var(--primary-light)",
                              color: "var(--primary)",
                              padding: "4px 14px",
                              borderRadius: 99,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {l.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── COURSES TAB ─────────────────────────────── */}
              {tab === "courses" && (
                <div style={{ paddingBottom: 24 }}>
                  {courses.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "48px 0",
                        color: "var(--text-muted)",
                      }}
                    >
                      <i
                        className="fa-solid fa-book-open"
                        style={{
                          fontSize: 40,
                          opacity: 0.3,
                          display: "block",
                          marginBottom: 12,
                        }}
                      />
                      <p>No published courses by this mentor yet.</p>
                      <button
                        onClick={() => navigate("/courses")}
                        style={{
                          marginTop: 14,
                          padding: "9px 22px",
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "var(--radius)",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "var(--font)",
                          fontSize: 13,
                        }}
                      >
                        Browse All Courses
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2,1fr)",
                        gap: 16,
                      }}
                    >
                      {courses.map((c) => (
                        <div
                          key={c.id}
                          onClick={() =>
                            navigate(
                              c.is_free ? `/learn/${c.id}` : `/courses/${c.id}`,
                            )
                          }
                          style={{
                            background: "#fff",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "var(--transition)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "var(--shadow)";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          {/* Thumbnail */}
                          <div
                            style={{
                              height: 130,
                              overflow: "hidden",
                              background: "var(--primary-light)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                            }}
                          >
                            {c.thumbnail ? (
                              <img
                                src={c.thumbnail}
                                alt={c.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <i
                                className="fa-solid fa-graduation-cap"
                                style={{
                                  fontSize: 40,
                                  color: "var(--primary)",
                                }}
                              />
                            )}
                            {c.is_free && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  left: 8,
                                  background: "#D1FAE5",
                                  color: "#065F46",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "3px 9px",
                                  borderRadius: 99,
                                }}
                              >
                                <i
                                  className="fa-solid fa-star"
                                  style={{ marginRight: 3 }}
                                />
                                FREE
                              </span>
                            )}
                          </div>
                          <div style={{ padding: 14 }}>
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--primary)",
                                fontWeight: 700,
                                marginBottom: 4,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {c.category}
                            </p>
                            <h4
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--text-dark)",
                                marginBottom: 8,
                                lineHeight: 1.4,
                                minHeight: 36,
                              }}
                            >
                              {c.title}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ display: "inline-flex", gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <i
                                    key={n}
                                    className={`fa-${n <= Math.round(c.rating || 4.8) ? "solid" : "regular"} fa-star`}
                                    style={{
                                      color: "var(--star,#F59E0B)",
                                      fontSize: 11,
                                    }}
                                  />
                                ))}
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                    marginLeft: 3,
                                  }}
                                >
                                  ({c.total_reviews || 0})
                                </span>
                              </span>
                              <span style={{ fontWeight: 800, fontSize: 15 }}>
                                {Number(c.is_free) === 1 ? (
                                  <span style={{ color: "#065F46" }}>Free</span>
                                ) : (
                                  <span style={{ color: "var(--accent)" }}>
                                    ${c.price}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── REVIEWS TAB ─────────────────────────────── */}
              {tab === "reviews" && (
                <div style={{ paddingBottom: 24 }}>
                  {/* Write review form */}
                  <div
                    style={{
                      background: "var(--bg-section)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: 20,
                      marginBottom: 24,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-dark)",
                        marginBottom: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <i
                        className="fa-solid fa-pen-to-square"
                        style={{ color: "var(--primary)" }}
                      />
                      Write a Review
                    </h3>

                    {reviewMsg ? (
                      <div
                        style={{
                          padding: "12px 16px",
                          background: "#D1FAE5",
                          border: "1px solid #A7F3D0",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "#065F46",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <i className="fa-solid fa-circle-check" />
                        {reviewMsg}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview}>
                        <div style={{ marginBottom: 12 }}>
                          <label
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 8,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Your Rating *
                          </label>
                          <StarRow
                            rating={reviewForm.rating}
                            size={28}
                            interactive
                          />
                          {reviewForm.rating > 0 && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-muted)",
                                marginLeft: 8,
                              }}
                            >
                              {
                                [
                                  "",
                                  "Poor",
                                  "Fair",
                                  "Good",
                                  "Very Good",
                                  "Excellent",
                                ][reviewForm.rating]
                              }
                            </span>
                          )}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text-muted)",
                              display: "block",
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Your Comment (optional)
                          </label>
                          <textarea
                            rows={3}
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm((f) => ({
                                ...f,
                                comment: e.target.value,
                              }))
                            }
                            placeholder="Share your experience with this mentor..."
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              border: "1.5px solid var(--border)",
                              borderRadius: 8,
                              fontSize: 13,
                              fontFamily: "var(--font)",
                              outline: "none",
                              resize: "vertical",
                              transition: "var(--transition)",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor = "var(--primary)")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor = "var(--border)")
                            }
                          />
                        </div>
                        {reviewError && (
                          <div
                            style={{
                              padding: "10px 14px",
                              background: "#FEE2E2",
                              border: "1px solid #FECACA",
                              borderRadius: 8,
                              fontSize: 12,
                              color: "#991B1B",
                              marginBottom: 10,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <i className="fa-solid fa-triangle-exclamation" />
                            {reviewError}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            padding: "10px 24px",
                            background: "var(--primary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius)",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            fontFamily: "var(--font)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            opacity: submitting ? 0.7 : 1,
                          }}
                        >
                          <i className="fa-solid fa-paper-plane" />
                          {submitting
                            ? "Submitting..."
                            : user
                              ? "Submit Review"
                              : "Login to Review"}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Existing reviews */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-dark)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <i
                        className="fa-solid fa-comments"
                        style={{ color: "var(--primary)" }}
                      />
                      Student Reviews
                      <span
                        style={{
                          background: "var(--primary-light)",
                          color: "var(--primary)",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {reviewPagination.total}
                      </span>
                    </h3>
                  </div>

                  {reviews.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "32px 0",
                        color: "var(--text-muted)",
                      }}
                    >
                      <i
                        className="fa-regular fa-star"
                        style={{
                          fontSize: 36,
                          opacity: 0.3,
                          display: "block",
                          marginBottom: 10,
                        }}
                      />
                      <p>No reviews yet. Be the first to review this mentor!</p>
                    </div>
                  ) : (
                    <>
                      {reviews.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            padding: "16px 0",
                            borderBottom: "1px solid var(--border-light)",
                            display: "flex",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: "var(--primary-light)",
                              color: "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 16,
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {r.reviewer_avatar ? (
                              <img
                                src={r.reviewer_avatar}
                                alt={r.reviewer}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              r.reviewer?.[0]?.toUpperCase()
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 4,
                              }}
                            >
                              <div>
                                <strong
                                  style={{
                                    fontSize: 14,
                                    color: "var(--text-dark)",
                                  }}
                                >
                                  {r.reviewer}
                                </strong>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                    marginLeft: 8,
                                  }}
                                >
                                  <i
                                    className="fa-regular fa-calendar"
                                    style={{ marginRight: 3 }}
                                  />
                                  {new Date(r.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                              <span style={{ display: "inline-flex", gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <i
                                    key={n}
                                    className={`fa-${n <= r.rating ? "solid" : "regular"} fa-star`}
                                    style={{
                                      color: "var(--star,#F59E0B)",
                                      fontSize: 12,
                                    }}
                                  />
                                ))}
                              </span>
                            </div>
                            {r.comment && (
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-muted)",
                                  lineHeight: 1.6,
                                  margin: 0,
                                }}
                              >
                                {r.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {reviewPagination.totalPages > 1 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            paddingTop: 20,
                          }}
                        >
                          <button
                            disabled={reviewPagination.page <= 1}
                            onClick={() =>
                              loadReviews(reviewPagination.page - 1)
                            }
                            style={{
                              padding: "6px 14px",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              background: "#fff",
                              cursor: "pointer",
                              fontSize: 13,
                              fontFamily: "var(--font)",
                              opacity: reviewPagination.page <= 1 ? 0.4 : 1,
                            }}
                          >
                            <i className="fa-solid fa-chevron-left" />
                          </button>
                          <span
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            Page {reviewPagination.page} of{" "}
                            {reviewPagination.totalPages}
                          </span>
                          <button
                            disabled={
                              reviewPagination.page >=
                              reviewPagination.totalPages
                            }
                            onClick={() =>
                              loadReviews(reviewPagination.page + 1)
                            }
                            style={{
                              padding: "6px 14px",
                              border: "1px solid var(--border)",
                              borderRadius: 6,
                              background: "#fff",
                              cursor: "pointer",
                              fontSize: 13,
                              fontFamily: "var(--font)",
                              opacity:
                                reviewPagination.page >=
                                reviewPagination.totalPages
                                  ? 0.4
                                  : 1,
                            }}
                          >
                            <i className="fa-solid fa-chevron-right" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <div className="mentor-detail-sidebar">
              <div className="mentor-dot-grid">
                {Array(60)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} />
                  ))}
              </div>

              <div className="mentor-stats-card">
                {/* All data comes from the mentor object — populated from mentors table */}
                {[
                  {
                    icon: "fa-book",
                    label: "Total Courses",
                    value: courses?.length ?? "—",
                  },
                  {
                    icon: "fa-star",
                    label: "Rating",
                    value: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span style={{ display: "inline-flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <i
                              key={n}
                              className={`fa-${n <= Math.round(mentor.rating || 0) ? "solid" : "regular"} fa-star`}
                              style={{
                                color: "var(--star,#F59E0B)",
                                fontSize: 13,
                              }}
                            />
                          ))}
                        </span>
                        <strong
                          style={{ color: "var(--primary)", fontSize: 13 }}
                        >
                          {Number(mentor.rating || 0).toFixed(1)}
                        </strong>
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          ({mentor.total_reviews ?? "—"})
                        </span>
                      </span>
                    ),
                  },
                  {
                    icon: "fa-clock",
                    label: "Experience",
                    value: `${mentor.experience || "—"} Years`,
                  },
                  {
                    icon: "fa-graduation-cap",
                    label: "Graduated",
                    value: mentor.graduated ? "Yes" : "No",
                  },
                  {
                    icon: "fa-language",
                    label: "Languages",
                    value: mentor.languages || "—",
                  },
                  {
                    icon: "fa-layer-group",
                    label: "Category",
                    value: mentor.category || "—",
                  },
                ].map((row) => (
                  <div key={row.label} className="mentor-stat-row">
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                      }}
                    >
                      <i
                        className={`fa-solid ${row.icon}`}
                        style={{
                          color: "var(--primary)",
                          width: 16,
                          textAlign: "center",
                        }}
                      />
                      {row.label}
                    </span>
                    <span className="mentor-stat-value">{row.value}</span>
                  </div>
                ))}

                {/* Social links — only show if populated */}
                {(mentor.facebook ||
                  mentor.instagram ||
                  mentor.twitter ||
                  mentor.linkedin) && (
                  <div
                    className="mentor-stat-row"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                      borderBottom: "none",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                      }}
                    >
                      <i
                        className="fa-solid fa-share-nodes"
                        style={{ color: "var(--primary)", width: 16 }}
                      />
                      Social
                    </span>
                    <div className="mentor-socials">
                      {mentor.facebook && (
                        <a
                          href={mentor.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="mentor-social-icon"
                        >
                          <i className="fa-brands fa-facebook" />
                        </a>
                      )}
                      {mentor.instagram && (
                        <a
                          href={mentor.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="mentor-social-icon"
                        >
                          <i className="fa-brands fa-instagram" />
                        </a>
                      )}
                      {mentor.twitter && (
                        <a
                          href={mentor.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="mentor-social-icon"
                        >
                          <i className="fa-brands fa-twitter" />
                        </a>
                      )}
                      {mentor.linkedin && (
                        <a
                          href={mentor.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="mentor-social-icon"
                        >
                          <i className="fa-brands fa-linkedin" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => navigate("/mentors")}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "1.5px solid var(--border)",
                    background: "#fff",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    color: "var(--text-body)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-body)";
                  }}
                >
                  <i className="fa-solid fa-arrow-left" /> All Mentors
                </button>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "none",
                    background: "var(--primary-light)",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <i className="fa-solid fa-house" /> Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
