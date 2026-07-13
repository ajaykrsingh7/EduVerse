import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { coursesAPI } from "../../services/api";
import { CourseCard } from "../../components/UI/Cards/Cards";
import { Spinner, Pagination, Tabs } from "../../components/Base";
import { COURSE_CATEGORIES } from "../../constants/index";
import "./Courses.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCartShopping,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");

  const category = searchParams.get("category") || "";
  const standard = searchParams.get("standard") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    coursesAPI
      .getAll({ category, standard, page, limit: 12, search })
      .then((res) => {
        setCourses(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [category, standard, page, search]);

  const setCategory = (val) => {
    setSearchParams(val ? { category: val } : {});
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header courses-page-header">
        <div className="container flex-between">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link> | <span className="active">Courses</span>
            </div>
            <h1 className="courses-page-title">
              EduVerse Courses
              <br />
              For All Standards
            </h1>
          </div>
          <div className="courses-header-img">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop"
              alt="Course Study"
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

      <div className="container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        {/* Category tabs */}
        <div style={{ marginBottom: 32 }}>
          <Tabs
            tabs={COURSE_CATEGORIES}
            active={category}
            onChange={setCategory}
          />
        </div>

        {/* Course list */}
        <h2 className="courses-section-title">
          {standard
            ? `Courses: ${standard}`
            : category
              ? `${category} Courses`
              : "All Available Courses "}
        </h2>

        {/* Search + sort bar */}
        <div className="courses-filter-bar">
          <div className="courses-search-wrap">
            <input
              className="courses-search"
              placeholder="Search Class, Course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="courses-search-btn">
              <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" /> Search
            </button>
          </div>
          <select className="courses-sort">
            <option>Sort by: Latest</option>
            <option>Sort by: Price</option>
            <option>Sort by: Rating</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : courses.length === 0 ? (
          <div className="courses-empty">
            No courses found. Try a different filter.
          </div>
        ) : (
          <>
            <div className="courses-list-grid">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) =>
                setSearchParams({ ...(category && { category }), page: p })
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
