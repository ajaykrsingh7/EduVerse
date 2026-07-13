import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { shopAPI, pricingAPI, mentorsAPI } from "../../services/api";
import { BookCard } from "../../components/UI/Cards/Cards";
import { Spinner, Pagination, Tabs, Alert } from "../../components/Base";
import Button from "../../components/UI/Button/Button";
import { BOOK_CATEGORIES } from "../../constants/index";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Shop.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

//Shop Page
export const ShopPage = () => {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [sort, setSort] = useState("latest");
  const [books, setBooks] = useState([]);
  const [popular, setPopular] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);

  // Sidebar "See More" toggles
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [showAllNew, setShowAllNew] = useState(false);

  const navigate = useNavigate();

  // Fetch sidebar featured books once
  useEffect(() => {
    shopAPI
      .getFeatured()
      .then((res) => {
        setPopular(res.data?.popular || []);
        setNewArr(res.data?.newArrivals || []);
      })
      .catch(() => {});
  }, []);

  // Fetch main grid whenever filters change
  useEffect(() => {
    setLoading(true);
    shopAPI
      .getBooks({ category, search, sort, page, limit: 9 })
      .then((res) => {
        setBooks(res.data || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchVal);
    setPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Sidebar list item — shows name + author
  const SidebarBookItem = ({ book }) => (
    <div
      className="book-list-item"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/shop/books/${book.id}`)}
    >
      <div className="book-list-item__cover">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <i
            className="fa-solid fa-book"
            style={{ fontSize: 22, color: "var(--primary)" }}
          />
        )}
      </div>
      <div className="book-list-item__info">
        <h4 className="book-list-item__title">{book.title}</h4>
        <div style={{ display: "flex", gap: 2, marginBottom: 3 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <i
              key={n}
              className={`fa-${n <= Math.round(book.rating || 4.9) ? "solid" : "regular"} fa-star`}
              style={{ color: "#F59E0B", fontSize: 10 }}
            />
          ))}
        </div>

        {book.author && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              margin: "2px 0 3px",
            }}
          >
            <i
              style={{ marginRight: 4, color: "var(--primary)", fontSize: 10 }}
            />
            By: {book.author}
          </p>
        )}
        <p className="book-list-item__price">₹{book.price}</p>
      </div>
    </div>
  );

  const visiblePopular = showAllPopular ? popular : popular.slice(0, 3);
  const visibleNew = showAllNew ? newArr : newArr.slice(0, 3);

  return (
    <div>
      {/* Page header */}
      <div className="page-header shop-page-header">
        <div className="container flex-between">
          <div>
            <div className="breadcrumb">
              <a href="/">
                <i className="fa-solid fa-house" style={{ marginRight: 5 }} />
                Home
              </a>
              <span style={{ margin: "0 6px" }}>/</span>
              <span className="active">
                <i
                  className="fa-solid fa-book-open"
                  style={{ marginRight: 5 }}
                />
                Shop
              </span>
            </div>
            <h1 className="shop-page-title">
              EduVerse Online
              <br />
              Book Shop
            </h1>
          </div>
          <div style={{ fontSize: 80, color: "var(--primary)", opacity: 0.15 }}>
            <i className="fa-solid fa-books" />
            //Image
          </div>
        </div>
      </div>

      <div
        className="container shop-layout"
        style={{ paddingTop: 32, paddingBottom: 60 }}
      >
        {/*  Sidebar  */}
        <aside className="shop-sidebar">
          {/* Popular Books */}
          <div className="shop-sidebar-section">
            <h3 className="shop-sidebar-title">
              <i style={{ marginRight: 8, color: "var(--accent)" }} />
              Popular Books
            </h3>
            {popular.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                No books yet.
              </p>
            ) : (
              visiblePopular.map((b) => <SidebarBookItem key={b.id} book={b} />)
            )}
            {popular.length > 3 && (
              <button
                onClick={() => setShowAllPopular((v) => !v)}
                className="shop-see-more"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  padding: 0,
                }}
              >
                <i
                  className={`fa-solid fa-chevron-${showAllPopular ? "up" : "down"}`}
                  style={{ marginRight: 5 }}
                />
                {showAllPopular ? "See Less" : `See ${popular.length - 3} More`}
              </button>
            )}
          </div>

          {/* New Arrivals */}
          <div className="shop-sidebar-section">
            <h3 className="shop-sidebar-title">
              <i
                className="fa-solid fa-sparkles"
                style={{ marginRight: 8, color: "var(--primary)" }}
              />
              New Arrivals
            </h3>
            {newArr.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                No new arrivals yet.
              </p>
            ) : (
              visibleNew.map((b) => <SidebarBookItem key={b.id} book={b} />)
            )}
            {newArr.length > 3 && (
              <button
                onClick={() => setShowAllNew((v) => !v)}
                className="shop-see-more"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  padding: 0,
                }}
              >
                <i
                  className={`fa-solid fa-chevron-${showAllNew ? "up" : "down"}`}
                  style={{ marginRight: 5 }}
                />
                {showAllNew ? "See Less" : `See ${newArr.length - 3} More`}
              </button>
            )}
          </div>
        </aside>

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div className="shop-main">
          {/* Category tabs */}
          <div style={{ marginBottom: 20 }}>
            <Tabs
              tabs={BOOK_CATEGORIES}
              active={category}
              onChange={handleCategoryChange}
            />
          </div>

          {/* Search + sort bar */}
          <form className="shop-filter-bar" onSubmit={handleSearch}>
            <div
              style={{
                display: "flex",
                flex: 1,
                minWidth: 200,
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <input
                className="shop-search"
                placeholder="Search by title, author, or category..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ border: "none" }}
              />
              <button type="submit" className="shop-search-btn">
                <i className="fa-solid fa-search" />
              </button>
            </div>
            <select
              className="shop-sort"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="latest">Sort by: Latest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </form>

          {/* Results count */}
          {!loading && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 16,
              }}
            >
              <i
                className="fa-solid fa-layer-group"
                style={{ marginRight: 6, color: "var(--primary)" }}
              />
              Showing {books.length} of {pagination.total} book
              {pagination.total !== 1 ? "s" : ""}
              {search && (
                <>
                  {" "}
                  for "<strong>{search}</strong>"
                </>
              )}
              {category && (
                <>
                  {" "}
                  in <strong>{category}</strong>
                </>
              )}
            </p>
          )}

          {loading ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 48 }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid var(--primary-light)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : books.length === 0 ? (
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
                  fontSize: 48,
                  opacity: 0.2,
                  display: "block",
                  marginBottom: 14,
                }}
              />
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>
                No books found
              </h3>
              <p style={{ fontSize: 14 }}>
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSearchVal("");
                  setCategory("");
                  setPage(1);
                }}
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
                <i
                  className="fa-solid fa-rotate-right"
                  style={{ marginRight: 6 }}
                />
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="books-grid">
                {books.map((b) => (
                  <BookCard key={b.id} book={b} layout="grid" />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Pricing Page
const CHECK = <FontAwesomeIcon icon={faCheck} className="check" />;
const CROSS = <FontAwesomeIcon icon={faXmark} className="cross" />;

export const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    pricingAPI
      .getAll()
      .then((res) => setPlans(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const planFeatures = (plan) => [
    { label: `${plan.hd_lessons} HD video lessons & tutorials`, ok: true },
    { label: `${plan.official_exams} Official exam`, ok: true },
    { label: `${plan.practice_questions} Practice questions`, ok: true },
    { label: `${plan.subscriptions} Month subscriptions`, ok: true },
    {
      label: `${plan.free_books} Free book${plan.free_books !== 1 ? "s" : ""}`,
      ok: true,
    },
    { label: "Practice quizzes & assignments", ok: !!plan.has_quizzes },
    { label: "In depth explanations", ok: !!plan.has_explanations },
    { label: "Personal instructor Assistance", ok: !!plan.has_instructor },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container flex-between">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link> | <span className="active">Pricing</span>
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--text-dark)",
                marginTop: 8,
              }}
            >
              Our Pre-ready
              <br />
              Pricing Packages
            </h1>
          </div>
          <div style={{ fontSize: 72 }}>
            <img
              src="https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGRpc2NvdW50fGVufDB8fDB8fHww"
              alt="Study Kit"
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

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <div className="pricing-header">
          <h2>
            We create a monthly pricing package
            <br />
            for all standard students
          </h2>
          <p>
            Basically we create this package for those who are really interested
            and get benefited from our courses or books. We want to make a low
            cost package for them so that they can purchase any courses with the
            package they buy from us. Also will get free books from every
            packages.
          </p>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className={`pricing-card ${i === 1 ? "pricing-card--featured" : ""}`}
              >
                <div className="pricing-card__icon">🏷</div>
                <h3 className="pricing-card__name">
                  {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Pack
                </h3>
                <ul className="pricing-features">
                  {planFeatures(plan).map((f, fi) => (
                    <li
                      key={fi}
                      className={`pricing-feature ${f.ok ? "pricing-feature--ok" : "pricing-feature--no"}`}
                    >
                      <span className="pf-icon">{f.ok ? CHECK : CROSS}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>
                <div className="pricing-price">₹{plan.price}</div>
                {/* <Button variant={i === 1 ? "primary" : "outline"} fullWidth>
                  Purchase Course
                </Button> */}

                <Button
                  variant={i === 1 ? "primary" : "outline"}
                  fullWidth
                  onClick={() =>
                    addItem({
                      id: plan.id,
                      type: "plan",
                      title: `${plan.name} Pack`,
                      price: plan.price,
                    })
                  }
                  disabled={isInCart(plan.id, "plan")}
                >
                  {isInCart(plan.id, "plan")
                    ? "✓ Added to Cart"
                    : "Purchase Course"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Become a Mentor Page                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
export const BecomeMentorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=info, 2=form, 3=success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("requirements");

  const [form, setForm] = useState({
    profession: "",
    experienceYears: "",
    education: "",
    specialization: "",
    bio: "",
    website: "",
    linkedin: "",
    teachCategories: "",
    courseIdeas: "",
    hoursPerWeek: "",
    languages: "English",
    agreedTerms: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!form.agreedTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    if (!form.profession || !form.bio || !form.teachCategories) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await mentorsAPI.apply(form);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORIES = [
    "Kindergarten",
    "High School",
    "College",
    "Computer",
    "Science",
    "Engineering",
    "All",
  ];
  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontFamily: "var(--font)",
    outline: "none",
    transition: "var(--transition)",
    color: "var(--text-dark)",
    background: "#fff",
  };
  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 3)
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#D1FAE5",
              color: "#059669",
              fontSize: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text-dark)",
              marginBottom: 12,
            }}
          >
            Application Submitted!
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: 8,
              lineHeight: 1.7,
            }}
          >
            Thank you for applying to become an EduVerse mentor. Our team will
            review your application within 2-3 business days.
          </p>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: 28,
              fontSize: 13,
            }}
          >
            You will receive an email notification once a decision has been
            made.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button variant="primary" onClick={() => navigate("/")}>
              <i className="fa-solid fa-house" style={{ marginRight: 8 }} />
              Go to Homepage
            </Button>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ background: "var(--bg-section)", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%)",
          padding: "60px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <span
              style={{
                background: "rgba(108,99,255,0.3)",
                color: "#a78bfa",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 99,
                marginBottom: 16,
                display: "inline-block",
                border: "1px solid rgba(167,139,250,0.3)",
                letterSpacing: 0.5,
              }}
            >
              <i
                className="fa-solid fa-graduation-cap"
                style={{ marginRight: 6 }}
              />
              Become an Educator
            </span>
            <h1
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              Join EduVerse as a Mentor
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 15,
                lineHeight: 1.8,
                marginBottom: 28,
              }}
            >
              Share your expertise, inspire thousands of students, and earn
              money doing what you love. Join 500+ educators on EduVerse.
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                {
                  icon: "fa-users",
                  label: "20k+ Students",
                  sub: "Active learners",
                },
                {
                  icon: "fa-star",
                  label: "4.8 Avg Rating",
                  sub: "Across all courses",
                },
                {
                  icon: "fa-dollar-sign",
                  label: "Earn Revenue",
                  sub: "Per enrollment",
                },
              ].map((s) => (
                <div key={s.label}>
                  <i
                    className={`fa-solid ${s.icon}`}
                    style={{
                      color: "#a78bfa",
                      fontSize: 20,
                      marginBottom: 6,
                      display: "block",
                    }}
                  />
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>
                    {s.label}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Hero image placeholder */}
          <div
            style={{
              width: 340,
              height: 240,
              borderRadius: 16,
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=680&auto=format&fit=crop"
              alt="Teacher in classroom"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(26,26,46,0.4), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        {step === 1 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Requirements */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 32,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: 8,
                }}
              >
                <i
                  className="fa-solid fa-clipboard-list"
                  style={{ color: "var(--primary)", marginRight: 10 }}
                />
                Apply as Instructor
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Teaching is a vital and admirable career. It comes with
                responsibility, preparation, and a passion for learning. Review
                the requirements below before applying.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 0,
                  borderBottom: "2px solid var(--border)",
                  marginBottom: 20,
                }}
              >
                {["requirements", "rules"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      background: "none",
                      fontFamily: "var(--font)",
                      fontSize: 13,
                      fontWeight: tab === t ? 700 : 500,
                      color: tab === t ? "var(--primary)" : "var(--text-muted)",
                      borderBottom:
                        tab === t
                          ? "2px solid var(--primary)"
                          : "2px solid transparent",
                      marginBottom: -2,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "var(--transition)",
                    }}
                  >
                    {t === "requirements"
                      ? "Instructor Requirements"
                      : "Instructor Rules"}
                  </button>
                ))}
              </div>

              <ul style={{ listStyle: "none", marginBottom: 28 }}>
                {(tab === "requirements"
                  ? [
                      "An undergraduate degree or equivalent experience",
                      "Participate in supervised teaching or mentorship",
                      "Valid teaching license or professional certification",
                      "Minimum 2 years of relevant experience",
                      "Commitment to creating quality learning content",
                    ]
                  : [
                      "Follow EduVerse community guidelines at all times",
                      "Respond to student questions within 48 hours",
                      "Keep course content accurate and up-to-date",
                      "No plagiarism or copyright infringement",
                      "Professional and respectful conduct in all interactions",
                    ]
                ).map((r) => (
                  <li
                    key={r}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border-light)",
                      fontSize: 14,
                      color: "var(--text-body)",
                      lineHeight: 1.5,
                    }}
                  >
                    <i
                      className="fa-solid fa-circle-dot"
                      style={{
                        color: "var(--accent)",
                        marginTop: 3,
                        flexShrink: 0,
                      }}
                    />
                    {r}
                  </li>
                ))}
              </ul>

              {/* <Button variant="primary" fullWidth onClick={() => {
                if (!user) { navigate('/login'); return; }
                setStep(2);
              }}> */}
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  setStep(2);
                }}
              >
                <i
                  className="fa-solid fa-pen-to-square"
                  style={{ marginRight: 8 }}
                />
                {user ? "Start Application" : "Login to Apply"}
              </Button>
            </div>

            {/* How it works */}
            <div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-dark)",
                  marginBottom: 24,
                }}
              >
                <i
                  className="fa-solid fa-list-ol"
                  style={{ color: "var(--primary)", marginRight: 10 }}
                />
                How to join as an instructor
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {[
                  {
                    step: 1,
                    icon: "fa-user-plus",
                    title: "Create Account",
                    desc: "Register for a free EduVerse account if you have not already.",
                    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop",
                  },
                  {
                    step: 2,
                    icon: "fa-file-pen",
                    title: "Submit Application",
                    desc: "Fill out the instructor application form with your professional details.",
                    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&auto=format&fit=crop",
                  },
                  {
                    step: 3,
                    icon: "fa-circle-check",
                    title: "Get Approved",
                    desc: "Our team reviews your application within 2-3 business days.",
                    img: "https://images.unsplash.com/photo-1552581234-26160f608093?w=120&auto=format&fit=crop",
                  },
                  {
                    step: 4,
                    icon: "fa-chalkboard-user",
                    title: "Start Teaching",
                    desc: "Access your mentor dashboard and start creating courses.",
                    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=120&auto=format&fit=crop",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                      background: "#fff",
                      borderRadius: 12,
                      padding: 16,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "var(--primary-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`fa-solid ${s.icon}`}
                        style={{ color: "var(--primary)", fontSize: 20 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--primary)",
                            background: "var(--primary-light)",
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          Step {s.step}
                        </span>
                        <strong
                          style={{ fontSize: 14, color: "var(--text-dark)" }}
                        >
                          {s.title}
                        </strong>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        {s.desc}
                      </p>
                    </div>
                    <img
                      src={s.img}
                      alt={s.title}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* Back button */}
            <button
              onClick={() => setStep(1)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font)",
              }}
            >
              <i className="fa-solid fa-arrow-left" /> Back
            </button>

            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 40,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--text-dark)",
                  marginBottom: 6,
                }}
              >
                <i
                  className="fa-solid fa-chalkboard-user"
                  style={{ color: "var(--primary)", marginRight: 10 }}
                />
                Instructor Application Form
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  marginBottom: 32,
                }}
              >
                Fields marked with{" "}
                <span style={{ color: "var(--accent)" }}>*</span> are required.
              </p>

              {error && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#991B1B",
                    marginBottom: 24,
                  }}
                >
                  <i
                    className="fa-solid fa-triangle-exclamation"
                    style={{ marginRight: 8 }}
                  />
                  {error}
                </div>
              )}

              <form onSubmit={handleApply}>
                {/* Section: Personal & Professional */}
                <div
                  style={{
                    marginBottom: 28,
                    paddingBottom: 28,
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <i
                      className="fa-solid fa-user-tie"
                      style={{ color: "var(--primary)" }}
                    />
                    Professional Information
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        Profession / Job Title{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="profession"
                        value={form.profession}
                        onChange={onChange}
                        required
                        placeholder="e.g. Senior Software Engineer"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Years of Experience{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="experienceYears"
                        type="number"
                        min="0"
                        value={form.experienceYears}
                        onChange={onChange}
                        required
                        placeholder="e.g. 5"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Highest Education{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="education"
                        value={form.education}
                        onChange={onChange}
                        required
                        placeholder="e.g. M.Sc. Computer Science"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Specialization{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="specialization"
                        value={form.specialization}
                        onChange={onChange}
                        required
                        placeholder="e.g. Web Development, Data Science"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>
                      Professional Bio{" "}
                      <span style={{ color: "var(--accent)" }}>*</span>
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={onChange}
                      required
                      rows={4}
                      placeholder="Tell students about your background, expertise, and teaching philosophy (minimum 100 characters)..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Section: Links */}
                <div
                  style={{
                    marginBottom: 28,
                    paddingBottom: 28,
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <i
                      className="fa-solid fa-link"
                      style={{ color: "var(--primary)" }}
                    />
                    Online Presence (Optional)
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        <i
                          className="fa-solid fa-globe"
                          style={{ marginRight: 6 }}
                        />
                        Website
                      </label>
                      <input
                        name="website"
                        value={form.website}
                        onChange={onChange}
                        placeholder="https://yoursite.com"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <i
                          className="fa-brands fa-linkedin"
                          style={{ marginRight: 6 }}
                        />
                        LinkedIn
                      </label>
                      <input
                        name="linkedin"
                        value={form.linkedin}
                        onChange={onChange}
                        placeholder="linkedin.com/in/yourname"
                        style={inputStyle}
                      />
                    </div>
                    {/* <div>
                      <label style={labelStyle}>
                        <i
                          className="fa-brands fa-youtube"
                          style={{ marginRight: 6 }}
                        />
                        YouTube
                      </label>
                      <input
                        name="youtube"
                        value={form.youtube}
                        onChange={onChange}
                        placeholder="youtube.com/@yourchannel"
                        style={inputStyle}
                      />
                    </div> */}
                  </div>
                </div>

                {/* Section: Teaching */}
                <div
                  style={{
                    marginBottom: 28,
                    paddingBottom: 28,
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <i
                      className="fa-solid fa-book-open-reader"
                      style={{ color: "var(--primary)" }}
                    />
                    Teaching Details
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>
                        Category to Teach{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <select
                        name="teachCategories"
                        value={form.teachCategories}
                        onChange={onChange}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Teaching Language{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="languages"
                        value={form.languages}
                        onChange={onChange}
                        required
                        placeholder="e.g. English, Hindi"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        Available Hours per Week{" "}
                        <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        name="hoursPerWeek"
                        type="number"
                        min="1"
                        max="40"
                        value={form.hoursPerWeek}
                        onChange={onChange}
                        required
                        placeholder="e.g. 10"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>
                      Course Ideas{" "}
                      <span style={{ color: "var(--accent)" }}>*</span>
                    </label>
                    <textarea
                      name="courseIdeas"
                      value={form.courseIdeas}
                      onChange={onChange}
                      required
                      rows={3}
                      placeholder="Describe 2-3 course ideas you would like to teach on EduVerse..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* Agreement */}
                <div style={{ marginBottom: 28 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="agreedTerms"
                      checked={form.agreedTerms}
                      onChange={onChange}
                      style={{
                        width: 18,
                        height: 18,
                        marginTop: 2,
                        accentColor: "var(--primary)",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-body)",
                        lineHeight: 1.6,
                      }}
                    >
                      I agree to the EduVerse{" "}
                      <a
                        href="#"
                        style={{ color: "var(--primary)", fontWeight: 600 }}
                      >
                        Instructor Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        style={{ color: "var(--primary)", fontWeight: 600 }}
                      >
                        Code of Conduct
                      </a>
                      . I confirm that all information provided is accurate and
                      truthful.
                    </span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    style={{ minWidth: 120 }}
                  >
                    <i
                      className="fa-solid fa-arrow-left"
                      style={{ marginRight: 8 }}
                    />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    style={{ flex: 1 }}
                  >
                    <i
                      className="fa-solid fa-paper-plane"
                      style={{ marginRight: 8 }}
                    />
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
