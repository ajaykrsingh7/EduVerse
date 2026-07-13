import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { coursesAPI, reviewsAPI } from "../../services/api";
import { CourseCard } from "../../components/UI/Cards/Cards";
import { Spinner } from "../../components/Base";
import Button from "../../components/UI/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./CourseDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCartShopping,
  faMagnifyingGlass,
  faCheck,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

const StarRating = ({ rating, size = 16, interactive = false, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        gap: 3,
        cursor: interactive ? "pointer" : "default",
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={`fa-${n <= (interactive ? hover || rating : Math.round(rating)) ? "solid" : "regular"} fa-star`}
          style={{
            color: "#F59E0B",
            fontSize: size,
            transition: "transform 0.1s",
            transform: hover === n && interactive ? "scale(1.2)" : "scale(1)",
          }}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(n)}
        />
      ))}
    </div>
  );
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab] = useState("overview");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");
  const [activeVideo, setActiveVideo] = useState(null);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    coursesAPI
      .getById(id)
      .then((res) => {
        setCourse(res.data);
        if (res.data?.playlist?.length) setActiveVideo(res.data.playlist[0]);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    try {
      await coursesAPI.enroll(id);
      setEnrollMsg("success");
    } catch (err) {
      setEnrollMsg(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!reviewForm.rating) {
      setReviewError("Please select a rating.");
      return;
    }
    setSubReview(true);
    setReviewError("");
    try {
      await reviewsAPI.createReview(id, {
        courseId: Number(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewSuccess(true);
      setReviewForm({ rating: 0, comment: "" });
      // Reload course to update rating
      coursesAPI.getById(id).then((res) => setCourse(res.data));
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubReview(false);
    }
  };

  if (loading) return <Spinner />;
  if (!course)
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
            marginBottom: 16,
            display: "block",
          }}
        />
        <h2 style={{ color: "var(--text-muted)" }}>Course not found.</h2>
        <Link
          to="/courses"
          style={{
            color: "var(--primary)",
            fontWeight: 600,
            marginTop: 12,
            display: "block",
          }}
        >
          ← Back to Courses
        </Link>
      </div>
    );

  const inCart = isInCart(Number(id), "course");

  const TABS = ["overview", "curriculum", "reviews"];

  return (
    <div className="course-detail-page">
      {/*  Hero banner  */}
      <div className="cd-hero">
        <div className="container cd-hero-inner">
          <div className="cd-hero-content">
            <div
              className="breadcrumb"
              style={{ marginBottom: 14, color: "rgba(255,255,255,0.6)" }}
            >
              <Link to="/" style={{ color: "rgba(255,255,255,0.6)" }}>
                Home
              </Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <Link to="/courses" style={{ color: "rgba(255,255,255,0.6)" }}>
                Courses
              </Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <span style={{ color: "#fff" }}>{course.title}</span>
            </div>

            <span className="cd-category-badge">{course.category}</span>
            <h1 className="cd-hero-title">{course.title}</h1>
            <p className="cd-hero-desc">
              {course.description ||
                "A comprehensive course designed to help you master the subject."}
            </p>

            <div className="cd-hero-meta">
              <div className="cd-meta-item">
                <i className="fa-solid fa-star" style={{ color: "#F59E0B" }} />
                <strong>{Number(course.rating || 4.8).toFixed(1)}</strong>
                <span>({course.total_reviews || 0} reviews)</span>
              </div>
              <div className="cd-meta-item">
                <i className="fa-solid fa-users" />
                <span>1,200+ students</span>
              </div>
              <div className="cd-meta-item">
                <i className="fa-solid fa-globe" />
                <span>{course.language || "English"}</span>
              </div>
              <div className="cd-meta-item">
                <i className="fa-solid fa-user-tie" />
                <span>
                  by <strong>{course.mentor_name}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  Sticky action bar  */}
      <div className="cd-action-bar">
        <div className="container cd-action-inner">
          <div className="cd-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`cd-tab ${activeTab === t ? "cd-tab--active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "overview" && (
                  <i
                    className="fa-solid fa-circle-info"
                    style={{ marginRight: 6 }}
                  />
                )}
                {t === "curriculum" && (
                  <i
                    className="fa-solid fa-list-check"
                    style={{ marginRight: 6 }}
                  />
                )}
                {t === "reviews" && (
                  <i className="fa-solid fa-star" style={{ marginRight: 6 }} />
                )}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body  */}
      <div className="container cd-body">
        <div className="cd-main">
          {/*  Overview tab  */}
          {activeTab === "overview" && (
            <div>
              {/* What you'll learn */}
              {course.learnings?.length > 0 && (
                <div className="cd-section">
                  <h2 className="cd-section-title">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      style={{ fontSize: 40, color: "var(--primary)" }}
                    />
                    What You'll Learn
                  </h2>
                  <div className="cd-learnings-grid">
                    {course.learnings.map((l, i) => (
                      <div key={i} className="cd-learning-item">
                        <i
                          className="fa-solid fa-check"
                          style={{
                            color: "var(--success)",
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        />
                        {l.point}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course description */}
              <div className="cd-section">
                <h2 className="cd-section-title">
                  <i
                    className="fa-solid fa-book-open"
                    style={{ marginRight: 10, color: "var(--primary)" }}
                  />
                  About This Course
                </h2>
                <p className="cd-desc-text">
                  {course.description ||
                    "This course provides a comprehensive overview of the subject with hands-on examples, practical exercises, and real-world applications."}
                </p>
              </div>

              {/* Instructor */}
              <div className="cd-section">
                <h2 className="cd-section-title">
                  <i
                    className="fa-solid fa-chalkboard-user"
                    style={{ marginRight: 10, color: "var(--primary)" }}
                  />
                  Your Instructor
                </h2>
                <div className="cd-instructor">
                  <div className="cd-instructor-avatar">
                    {course.mentor_avatar ? (
                      <img
                        src={course.mentor_avatar}
                        alt={course.mentor_name}
                      />
                    ) : (
                      <i
                        className="fa-solid fa-user"
                        style={{ fontSize: 32 }}
                      />
                    )}
                  </div>
                  <div className="cd-instructor-info">
                    <h3>{course.mentor_name}</h3>
                    <p>{course.mentor_title || "Instructor at EduVerse"}</p>
                    <div className="cd-instructor-stats">
                      <span>
                        <i
                          className="fa-solid fa-star"
                          style={{ color: "#F59E0B", marginRight: 4 }}
                        />
                        {Number(course.mentor_rating || 4.9).toFixed(1)} Rating
                      </span>
                      <span>
                        <i
                          className="fa-solid fa-users"
                          style={{ marginRight: 4, color: "var(--primary)" }}
                        />
                        Students enrolled
                      </span>
                      <span>
                        <i
                          className="fa-solid fa-clock"
                          style={{ marginRight: 4, color: "var(--primary)" }}
                        />
                        {course.mentor_experience || 5}+ years experience
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar courses */}
              {course.similar?.length > 0 && (
                <div className="cd-section">
                  <h2 className="cd-section-title">
                    <i
                      className="fa-solid fa-layer-group"
                      style={{ marginRight: 10, color: "var(--primary)" }}
                    />
                    Similar Courses
                  </h2>
                  <div className="cd-similar-grid">
                    {course.similar.slice(0, 4).map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Curriculum tab  */}
          {activeTab === "curriculum" && (
            <div className="cd-section">
              <h2 className="cd-section-title">
                <i
                  className="fa-solid fa-list-check"
                  style={{ marginRight: 10, color: "var(--primary)" }}
                />
                Course Content
              </h2>
              <div className="cd-playlist-info">
                <span>
                  <i
                    className="fa-solid fa-layer-group"
                    style={{ marginRight: 4 }}
                  />
                  {course.chapters?.length || 0} sections
                </span>
                <span>
                  <i className="fa-solid fa-film" style={{ marginRight: 4 }} />
                  {course.lessons || 0} lessons
                </span>
                <span>
                  <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />
                  {course.duration || "Self-paced"}
                </span>
                <span>
                  <i
                    className="fa-solid fa-infinity"
                    style={{ marginRight: 4 }}
                  />
                  {course.access || "Lifetime"} access
                </span>
              </div>

              {/* Structured chapters from curriculum builder */}
              {course.chapters?.length > 0 ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {course.chapters.map((ch, ci) => (
                    <div
                      key={ch.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Chapter header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: "var(--bg-section)",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {ci + 1}
                        </div>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--text-dark)",
                            flex: 1,
                          }}
                        >
                          {ch.title}
                        </span>
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          <i
                            className="fa-solid fa-book-open"
                            style={{ marginRight: 4 }}
                          />
                          {ch.lessons?.length || 0} lessons
                        </span>
                      </div>
                      {/* Lessons list */}
                      {ch.lessons?.map((lesson, li) => (
                        <div
                          key={lesson.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "11px 16px",
                            borderTop: "1px solid var(--border-light)",
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "var(--primary-light)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              color: "var(--primary)",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className="fa-solid fa-play"
                              style={{ fontSize: 9 }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--text-body)",
                              flex: 1,
                            }}
                          >
                            {ci + 1}.{li + 1} {lesson.title}
                          </span>
                          {lesson.code_lang && lesson.code_lang !== "text" && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "var(--primary)",
                                background: "var(--primary-light)",
                                padding: "2px 7px",
                                borderRadius: 99,
                              }}
                            >
                              {lesson.code_lang}
                            </span>
                          )}
                        </div>
                      ))}
                      {/* Quiz indicator */}
                      {ch.quizzes?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 16px",
                            borderTop: "1px solid var(--border-light)",
                            background: "#fffbeb",
                            fontSize: 12,
                            color: "#92400E",
                            fontWeight: 600,
                          }}
                        >
                          <i
                            className="fa-solid fa-circle-question"
                            style={{ color: "#F59E0B" }}
                          />
                          {ch.quizzes.length} quiz question
                          {ch.quizzes.length > 1 ? "s" : ""} at end of chapter
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : course.playlist?.length > 0 ? (
                // Fallback: show old-style playlist if no chapters
                course.playlist.map((item, i) => (
                  <div
                    key={item.id || i}
                    className={`cd-playlist-item ${activeVideo?.id === item.id ? "cd-playlist-item--active" : ""}`}
                    onClick={() => setActiveVideo(item)}
                  >
                    <div className="cd-playlist-item__num">
                      <i
                        className={`fa-solid fa-${activeVideo?.id === item.id ? "pause" : "play"}`}
                      />
                    </div>
                    <div className="cd-playlist-item__info">
                      <span className="cd-playlist-item__title">
                        {item.title}
                      </span>
                    </div>
                    <span className="cd-playlist-item__dur">
                      <i
                        className="fa-regular fa-clock"
                        style={{ marginRight: 4 }}
                      />
                      {item.duration || "—"}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <i
                    className="fa-solid fa-film"
                    style={{
                      fontSize: 40,
                      opacity: 0.3,
                      display: "block",
                      marginBottom: 12,
                    }}
                  />
                  <p>Course content will be available after enrollment.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews tab  */}
          {activeTab === "reviews" && (
            <div className="cd-section">
              {/* Rating summary */}
              <div className="cd-rating-summary">
                <div className="cd-rating-big">
                  <div className="cd-rating-num">
                    {Number(course.rating || 4.8).toFixed(1)}
                  </div>
                  <StarRating rating={course.rating || 4.8} size={20} />
                  <div className="cd-rating-label">Course Rating</div>
                </div>
              </div>

              {/* Write a review */}
              <div className="cd-review-form">
                <h3
                  className="cd-section-title"
                  style={{ fontSize: 18, marginBottom: 16 }}
                >
                  <i
                    className="fa-solid fa-pen-to-square"
                    style={{ marginRight: 8, color: "var(--primary)" }}
                  />
                  Write a Review
                </h3>
                {reviewSuccess ? (
                  <div className="cd-review-success">
                    <i
                      className="fa-solid fa-circle-check"
                      style={{
                        fontSize: 24,
                        color: "var(--success)",
                        marginBottom: 8,
                        display: "block",
                      }}
                    />
                    <strong>Review submitted!</strong> Thank you for your
                    feedback.
                  </div>
                ) : (
                  <form onSubmit={handleReview}>
                    <div style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        Your Rating *
                      </label>
                      <StarRating
                        rating={reviewForm.rating}
                        size={28}
                        interactive
                        onChange={(r) =>
                          setReviewForm((f) => ({ ...f, rating: r }))
                        }
                      />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Your Review
                      </label>
                      <textarea
                        className="cd-review-textarea"
                        rows={4}
                        placeholder="Share your experience with this course..."
                        value={reviewForm.comment}
                        onChange={(e) =>
                          setReviewForm((f) => ({
                            ...f,
                            comment: e.target.value,
                          }))
                        }
                      />
                    </div>
                    {reviewError && (
                      <div
                        style={{
                          background: "#FEE2E2",
                          border: "1px solid #FECACA",
                          borderRadius: 6,
                          padding: "10px 14px",
                          fontSize: 13,
                          color: "#991B1B",
                          marginBottom: 12,
                        }}
                      >
                        <i
                          className="fa-solid fa-triangle-exclamation"
                          style={{ marginRight: 8 }}
                        />
                        {reviewError}
                      </div>
                    )}
                    <button
                      className="cd-submit-review-btn"
                      type="submit"
                      disabled={submittingReview}
                    >
                      <i
                        className="fa-solid fa-paper-plane"
                        style={{ marginRight: 8 }}
                      />
                      {submittingReview
                        ? "Submitting..."
                        : user
                          ? "Submit Review"
                          : "Login to Review"}
                    </button>
                  </form>
                )}
              </div>

              {/* Existing reviews */}
              <h3
                className="cd-section-title"
                style={{ fontSize: 18, marginTop: 32, marginBottom: 16 }}
              >
                <i
                  className="fa-solid fa-comments"
                  style={{ marginRight: 8, color: "var(--primary)" }}
                />
                Student Reviews ({course.reviews?.length || 0})
              </h3>
              {course.reviews?.length > 0 ? (
                course.reviews.map((r) => (
                  <div key={r.id} className="cd-review-item">
                    <div className="cd-review-item__header">
                      <div className="cd-review-item__avatar">
                        {r.reviewer_avatar ? (
                          <img src={r.reviewer_avatar} alt={r.reviewer} />
                        ) : (
                          r.reviewer?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text-dark)",
                            fontSize: 14,
                          }}
                        >
                          {r.reviewer}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={13} />
                    </div>
                    {r.comment && (
                      <p className="cd-review-item__comment">{r.comment}</p>
                    )}
                  </div>
                ))
              ) : (
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
                      marginBottom: 12,
                    }}
                  />
                  No reviews yet. Be the first to review this course!
                </div>
              )}
            </div>
          )}
        </div>

        {/*  Sticky sidebar  */}
        <aside className="cd-sidebar">
          {/* Course thumbnail / video */}
          <div className="cd-sidebar-thumb">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} />
            ) : (
              <div className="cd-sidebar-thumb__placeholder">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  style={{ fontSize: 40, color: "var(--primary)" }}
                />
              </div>
            )}
            <div className="cd-sidebar-thumb__overlay">
              <i className="fa-solid fa-play" />
              <span>Preview Course</span>
            </div>
          </div>

          <div className="cd-sidebar-box">
            {/* Enroll message */}
            {enrollMsg && (
              <div
                className={`cd-enroll-msg cd-enroll-msg--${enrollMsg === "success" ? "success" : "error"}`}
              >
                <i
                  className={`fa-solid fa-${enrollMsg === "success" ? "circle-check" : "circle-xmark"}`}
                />
                {enrollMsg === "success"
                  ? "Successfully enrolled! Check My Courses."
                  : enrollMsg}
              </div>
            )}

            <div className="cd-price-row">
              <span className="cd-price">${course.price}</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <button
                className={`cd-cart-btn ${inCart ? "cd-cart-btn--added" : ""}`}
                onClick={() =>
                  addItem({
                    id: course.id,
                    type: "course",
                    title: course.title,
                    price: course.price,
                    thumbnail: course.thumbnail || null,
                  })
                }
                disabled={inCart}
              >
                <i
                  className={`fa-solid fa-${inCart ? "check" : "cart-shopping"}`}
                />
                {inCart ? "Added to Cart" : "Add to Cart"}
              </button>
              {inCart && (
                <button
                  className="cd-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  <i className="fa-solid fa-arrow-right" /> Checkout Now
                </button>
              )}
              <button
                className="cd-enroll-btn"
                disabled={enrolling || enrollMsg === "success"}
                onClick={handleEnroll}
              >
                <i className="fa-solid fa-user-plus" />
                {enrollMsg === "success"
                  ? "Enrolled!"
                  : enrolling
                    ? "Enrolling..."
                    : "Enroll for Free"}
              </button>
            </div>

            {/* Course meta */}
            <div className="cd-meta-list">
              {[
                {
                  icon: "fa-clock",
                  label: "Duration",
                  val: course.duration || "Self-paced",
                },
                { icon: "fa-film", label: "Lessons", val: course.lessons || 0 },
                {
                  icon: "fa-circle-question",
                  label: "Quizzes",
                  val: course.quizzes || 0,
                },
                {
                  icon: "fa-certificate",
                  label: "Certificate",
                  val: course.has_cert ? "Included" : "Not included",
                },
                {
                  icon: "fa-globe",
                  label: "Language",
                  val: course.language || "English",
                },
                {
                  icon: "fa-infinity",
                  label: "Access",
                  val: course.access || "Lifetime",
                },
                {
                  icon: "fa-signal",
                  label: "Level",
                  val: course.standard || "All levels",
                },
              ].map((row) => (
                <div key={row.label} className="cd-meta-row">
                  <i
                    className={`fa-solid ${row.icon}`}
                    style={{
                      color: "var(--primary)",
                      width: 16,
                      textAlign: "center",
                    }}
                  />
                  <span>{row.label}</span>
                  <strong>{row.val}</strong>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="cd-share">
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Share:
              </span>
              {[
                { icon: "fa-brands fa-facebook", color: "#1877F2" },
                { icon: "fa-brands fa-twitter", color: "#1DA1F2" },
                { icon: "fa-brands fa-linkedin", color: "#0A66C2" },
                { icon: "fa-solid fa-link", color: "var(--primary)" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="cd-share-btn"
                  style={{ color: s.color }}
                >
                  <i className={s.icon} />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;
