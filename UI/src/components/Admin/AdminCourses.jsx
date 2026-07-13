import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/adminApi";
import {
  AdminTable,
  AdminPagination,
  AdminModal,
  ConfirmModal,
  useToast,
  Toast,
} from "./AdminComponents";

const CATEGORIES = [
  "Kindergarten",
  "High School",
  "College",
  "Computer",
  "Science",
  "Engineering",
];

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEdit] = useState(null);
  const [delCourse, setDel] = useState(null);
  const [form, setForm] = useState({});
  const { toast, show, clear } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getCourses({ search, category: catFilter, page, limit: 15 })
      .then((res) => {
        setCourses(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, catFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ is_published: 1, language: "English", access: "Lifetime" });
    setEdit(null);
    setShowForm(true);
  };
  // const openEdit = (c) => {
  //   setForm({ ...c });
  //   setEdit(c);
  //   setShowForm(true);
  // };

  const openEdit = (c) => {
    const { mentor_name, mentor_avatar, ...safeCourse } = c;
    setForm(safeCourse);
    setEdit(c);
    setShowForm(true);
  };

  const onFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // const handleSave = async () => {
  //   try {
  //     if (editCourse) {
  //       await adminAPI.updateCourse(editCourse.id, form);
  //       show("Course updated");
  //     } else {
  //       await adminAPI.createCourse(form);
  //       show("Course created");
  //     }
  //     setShowForm(false);
  //     load();
  //   } catch (err) {
  //     show(err.message, "error");
  //   }
  // };

  const handleSave = async () => {
    try {
      const {
        mentor_name,
        mentor_avatar,
        created_at,
        updated_at,
        ...safeData
      } = form;

      if (editCourse) {
        await adminAPI.updateCourse(editCourse.id, safeData);
      } else {
        await adminAPI.createCourse(safeData);
      }

      setShowForm(false);
      load();
    } catch (err) {
      show(err.message, "error");
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.togglePublish(id);
      show("Publish status toggled");
      load();
    } catch {
      show("Failed to toggle publish", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteCourse(delCourse.id);
      show("Course deleted");
      setDel(null);
      load();
    } catch {
      show("Failed to delete", "error");
    }
  };

  const COLS = [
    {
      key: "sn",
      label: "Sn. No",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600 }}>{index + 1}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#ffffff", fontSize: 13 }}>
            {v}
          </div>
          <div style={{ fontSize: 11, color: "var(--ad-muted)" }}>
            {r.category} · {r.mentor_name}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (v) => (
        <span style={{ color: "var(--ad-success)", fontWeight: 700 }}>
          ${v}
        </span>
      ),
    },
    {
      key: "lessons",
      label: "Lessons",
      render: (v) => <span style={{ color: "var(--ad-light)" }}>{v}</span>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (v) => (
        <span style={{ color: "var(--ad-warning)" }}>
          ★ {Number(v).toFixed(1)}
        </span>
      ),
    },
    {
      key: "is_published",
      label: "Status",
      render: (v, r) => (
        <button
          className={`ad-pill ad-pill--dot ad-pill--${v ? "success" : "warning"}`}
          style={{ cursor: "pointer", border: "none" }}
          onClick={() => handleToggle(r.id)}
        >
          {v ? "Published" : "Draft"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, r) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="ad-btn ad-btn--ghost ad-btn--sm"
            onClick={() => openEdit(r)}
          >
            Edit
          </button>
          <button
            className="ad-btn ad-btn--danger ad-btn--sm"
            onClick={() => setDel(r)}
          >
            Delete
          </button>
        </div>
      ),
    },

    {
      key: "is_free",
      label: "Type",
      render: (v) => (
        <span className={`ad-pill ad-pill--${v ? "success" : "purple"}`}>
          {v ? "Free" : "Paid"}
        </span>
      ),
    },
  ];

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div className="admin-filters">
        <div className="admin-filter-search">
          <span style={{ color: "var(--ad-muted)" }}><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="admin-filter-select"
          value={catFilter}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="ad-btn ad-btn--primary" onClick={openCreate}>
          + Add Course
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">All Courses</div>
            <div className="admin-card__subtitle">{total} total courses</div>
          </div>
        </div>
        <AdminTable columns={COLS} data={courses} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        open={showForm}
        title={editCourse ? "Edit Course" : "Create New Course"}
        onClose={() => setShowForm(false)}
        footer={
          <>
            <button
              className="ad-btn ad-btn--ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="ad-btn ad-btn--primary" onClick={handleSave}>
              {editCourse ? "Save Changes" : "Create Course"}
            </button>
          </>
        }
      >
        <div className="ad-form-group">
          <label className="ad-form-label">Course Title *</label>
          <input
            className="ad-form-input"
            name="title"
            value={form.title || ""}
            onChange={onFormChange}
            placeholder="e.g. Maths for Standard 3 Students"
          />
        </div>
        <div className="ad-form-grid2">
          <div className="ad-form-group">
            <label className="ad-form-label">Category *</label>
            <select
              className="ad-form-select"
              name="category"
              value={form.category || ""}
              onChange={onFormChange}
            >
              <option value="">Select</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Price ($) *</label>
            <input
              className="ad-form-input"
              name="price"
              type="number"
              value={form.price || ""}
              onChange={onFormChange}
              placeholder="49.00"
            />
          </div>
        </div>
        <div className="ad-form-grid2">
          <div className="ad-form-group">
            <label className="ad-form-label">Lessons</label>
            <input
              className="ad-form-input"
              name="lessons"
              type="number"
              value={form.lessons || ""}
              onChange={onFormChange}
              placeholder="30"
            />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Quizzes</label>
            <input
              className="ad-form-input"
              name="quizzes"
              type="number"
              value={form.quizzes || ""}
              onChange={onFormChange}
              placeholder="5"
            />
          </div>
        </div>
        <div className="ad-form-grid2">
          <div className="ad-form-group">
            <label className="ad-form-label">Language</label>
            <input
              className="ad-form-input"
              name="language"
              value={form.language || "English"}
              onChange={onFormChange}
            />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Mentor ID</label>
            <input
              className="ad-form-input"
              name="mentor_id"
              type="number"
              value={form.mentor_id || ""}
              onChange={onFormChange}
              placeholder="1"
            />
          </div>
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">Description</label>
          <textarea
            className="ad-form-textarea"
            name="description"
            value={form.description || ""}
            onChange={onFormChange}
            placeholder="Course description..."
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">
            Free Course (no payment required)
          </label>
          <select
            className="ad-form-select"
            name="is_free"
            value={form.is_free ?? 0}
            onChange={onFormChange}
          >
            <option value={0}>No — Paid course</option>
            <option value={1}>Yes — Free to read</option>
          </select>
        </div>
      </AdminModal>

      <ConfirmModal
        open={!!delCourse}
        message={`Delete course "${delCourse?.title}"? All enrollments in this course will also be deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setDel(null)}
      />
    </>
  );
};

export default AdminCourses;
