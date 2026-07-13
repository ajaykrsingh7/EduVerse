import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/adminApi";
import {
  AdminTable,
  AdminPagination,
  AdminModal,
  ConfirmModal,
  AvatarCell,
  useToast,
  Toast,
} from "./AdminComponents";

// MENTORS
export const AdminMentors = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [search, setSearch] = useState("");
  const [delMentor, setDel] = useState(null);
  const { toast, show, clear } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getMentors({ search, page, limit: 15 })
      .then((res) => {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleApproval(id);
      show("Approval status updated");
      load();
    } catch {
      show("Failed", "error");
    }
  };
  const handleDelete = async () => {
    try {
      await adminAPI.deleteMentor(delMentor.id);
      show("Mentor deleted");
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
      key: "full_name",
      label: "Mentor",
      render: (v, r) => (
        <AvatarCell name={v} email={r.email} avatar={r.avatar} />
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (v) => (
        <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>{v}</span>
      ),
    },
    {
      key: "total_courses",
      label: "Courses",
      render: (v) => (
        <span style={{ color: "var(--ad-light)", fontWeight: 600 }}>{v}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (v) => (
        <span style={{ color: "var(--ad-warning)" }}>
          ★ {Number(v || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: "is_approved",
      label: "Status",
      render: (v, r) => (
        <button
          className={`ad-pill ad-pill--dot ad-pill--${v ? "success" : "warning"}`}
          style={{ cursor: "pointer", border: "none" }}
          onClick={() => handleToggle(r.id)}
        >
          {v ? "Approved" : "Pending"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, r) => (
        <button
          className="ad-btn ad-btn--danger ad-btn--sm"
          onClick={() => setDel(r)}
        >
          Remove
        </button>
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
            placeholder="Search mentors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">All Mentors</div>
        </div>
        <AdminTable columns={COLS} data={data} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>
      <ConfirmModal
        open={!!delMentor}
        message={`Remove mentor "${delMentor?.full_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDel(null)}
      />
    </>
  );
};

// Books
const BOOK_CATS = ["Kindergarten", "High School", "College", "All"];

export const AdminBooks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [showForm, setShow] = useState(false);
  const [editBook, setEdit] = useState(null);
  const [delBook, setDel] = useState(null);
  const [form, setForm] = useState({});
  const { toast, show: showToast, clear } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getBooks({ search, category: cat, page, limit: 15 })
      .then((res) => {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, cat, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm({ is_new: 0 });
    setEdit(null);
    setShow(true);
  };
  const openEdit = (b) => {
    setForm({ ...b });
    setEdit(b);
    setShow(true);
  };
  const onFC = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // const handleSave = async () => {
  //   try {
  //     if (editBook) {
  //       await adminAPI.updateBook(editBook.id, form);
  //       showToast("Book updated");
  //     } else {
  //       await adminAPI.createBook(form);
  //       showToast("Book created");
  //     }
  //     setShow(false);
  //     load();
  //   } catch {
  //     showToast("Failed", "error");
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

      if (editBook) {
        await adminAPI.updateBook(editBook.id, safeData);
        showToast("Book updated");
      } else {
        await adminAPI.createBook(safeData);
        showToast("Book created");
      }

      setShow(false);
      load();
    } catch {
      showToast("Failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteBook(delBook.id);
      showToast("Book deleted");
      setDel(null);
      load();
    } catch {
      showToast("Failed", "error");
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
          <div style={{ fontWeight: 600, color: "#fff" }}>{v}</div>
          <div style={{ fontSize: 11, color: "var(--ad-muted)" }}>
            {r.author}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (v) => <span className="ad-pill ad-pill--purple">{v}</span>,
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
      key: "rating",
      label: "Rating",
      render: (v) => (
        <span style={{ color: "var(--ad-warning)" }}>
          ★ {Number(v || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: "is_new",
      label: "New",
      render: (v) =>
        v ? <span className="ad-pill ad-pill--success">New</span> : "—",
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
  ];

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />
      <div className="admin-filters">
        <div className="admin-filter-search">
          <span style={{ color: "var(--ad-muted)" }}><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            placeholder="Search books..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="admin-filter-select"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {BOOK_CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="ad-btn ad-btn--primary" onClick={openCreate}>
          + Add Book
        </button>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">All Books</div>
        </div>
        <AdminTable columns={COLS} data={data} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <AdminModal
        open={showForm}
        title={editBook ? "Edit Book" : "Add New Book"}
        onClose={() => setShow(false)}
        footer={
          <>
            <button
              className="ad-btn ad-btn--ghost"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
            <button className="ad-btn ad-btn--primary" onClick={handleSave}>
              {editBook ? "Save" : "Create"}
            </button>
          </>
        }
      >
        <div className="ad-form-group">
          <label className="ad-form-label">Title *</label>
          <input
            className="ad-form-input"
            name="title"
            value={form.title || ""}
            onChange={onFC}
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">Author</label>
          <input
            className="ad-form-input"
            name="author"
            value={form.author || ""}
            onChange={onFC}
          />
        </div>
        <div className="ad-form-grid2">
          <div className="ad-form-group">
            <label className="ad-form-label">Category</label>
            <select
              className="ad-form-select"
              name="category"
              value={form.category || ""}
              onChange={onFC}
            >
              <option value="">Select</option>
              {BOOK_CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Price ($)</label>
            <input
              className="ad-form-input"
              name="price"
              type="number"
              value={form.price || ""}
              onChange={onFC}
            />
          </div>
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">Mark as New?</label>
          <select
            className="ad-form-select"
            name="is_new"
            value={form.is_new ?? 0}
            onChange={onFC}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>
        </div>
      </AdminModal>

      <ConfirmModal
        open={!!delBook}
        message={`Delete book "${delBook?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDel(null)}
      />
    </>
  );
};

// APPLICATIONS
export const AdminApplications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [statusF, setStatus] = useState("pending");
  const { toast, show, clear } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getApplications({ status: statusF, page, limit: 15 })
      .then((res) => {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [statusF, page]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id, status) => {
    try {
      await adminAPI.reviewApplication(id, status);
      show(`Application ${status}`);
      load();
    } catch {
      show("Failed", "error");
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
      key: "full_name",
      label: "Applicant",
      render: (v, r) => <AvatarCell name={v} email={r.email} />,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          className={`ad-pill ad-pill--dot ad-pill--${v === "approved" ? "success" : v === "rejected" ? "danger" : "warning"}`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "applied_at",
      label: "Applied",
      render: (v) => (
        <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, r) =>
        r.status === "pending" ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="ad-btn ad-btn--success ad-btn--sm"
              onClick={() => review(r.id, "approved")}
            >
              ✓ Approve
            </button>
            <button
              className="ad-btn ad-btn--danger ad-btn--sm"
              onClick={() => review(r.id, "rejected")}
            >
              ✕ Reject
            </button>
          </div>
        ) : (
          <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>
            Reviewed
          </span>
        ),
    },
  ];

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />
      <div className="admin-filters">
        <select
          className="admin-filter-select"
          value={statusF}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">Instructor Applications</div>
            <div className="admin-card__subtitle">
              {total} total applications
            </div>
          </div>
        </div>
        <AdminTable columns={COLS} data={data} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

//NEWSLETTER
export const AdminNewsletter = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getNewsletter({ page, limit: 15 })
      .then((res) => {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const COLS = [
    {
      key: "sn",
      label: "Sn. No",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600 }}>{index + 1}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v) => (
        <span style={{ color: "#fff", fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      key: "created_at",
      label: "Subscribed",
      render: (v) => (
        <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>
          {new Date(v).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div>
          <div className="admin-card__title">Newsletter Subscribers</div>
          <div className="admin-card__subtitle">{total} subscribers</div>
        </div>
        <button
          className="ad-btn ad-btn--ghost"
          onClick={() => {
            const csv = data.map((d) => d.email).join("\n");
            navigator.clipboard.writeText(csv);
          }}
        >
          Copy All Emails
        </button>
      </div>
      <AdminTable
        columns={COLS}
        data={data.map((d, i) => ({ ...d, _i: i }))}
        loading={loading}
      />
      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
};

// ENROLLMENTS
export const AdminEnrollments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getEnrollments({ search, page, limit: 15 })
      .then((res) => {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const COLS = [
    {
      key: "sn",
      label: "Sn. No",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600 }}>{index + 1}</span>
      ),
    },
    {
      key: "student",
      label: "Student",
      render: (v, r) => <AvatarCell name={v} email={r.email} />,
    },
    {
      key: "course",
      label: "Course",
      render: (v) => (
        <span style={{ color: "#fff", fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      key: "price",
      label: "Paid",
      render: (v) => (
        <span style={{ color: "var(--ad-success)", fontWeight: 700 }}>
          ${v}
        </span>
      ),
    },
    {
      key: "enrolled_at",
      label: "Date",
      render: (v) => (
        <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>
          {new Date(v).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filter-search">
          <span style={{ color: "var(--ad-muted)" }}><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">All Enrollments</div>
            <div className="admin-card__subtitle">
              {total} total enrollments
            </div>
          </div>
        </div>
        <AdminTable columns={COLS} data={data} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export const AdminPricing = () => {
  const [plans, setPlans] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({});
  const { toast, show, clear } = useToast();

  const load = () => {
    import("../../services/api").then(({ pricingAPI }) => {
      pricingAPI.getAll().then((res) => setPlans(res.data || []));
    });
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({ ...plan });
  };

  const onFC = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSave = async () => {
    try {
      await adminAPI.updatePlan(editPlan.id, {
        price: form.price,
        hd_lessons: form.hd_lessons,
        official_exams: form.official_exams,
        practice_questions: form.practice_questions,
        subscriptions: form.subscriptions,
        free_books: form.free_books,
        has_quizzes: form.has_quizzes,
        has_explanations: form.has_explanations,
        has_instructor: form.has_instructor,
      });
      show("Plan updated successfully");
      setEditPlan(null);
      load();
    } catch (err) {
      show(err.message, "error");
    }
  };

  const PLAN_COLORS = {
    basic: "#3498DB",
    standard: "#6C63FF",
    premium: "#F39C12",
  };

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">Pricing Plans</div>
          <div className="admin-card__subtitle">
            Click Edit on any plan to update its details
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: "var(--ad-surface2)",
                border: `1px solid ${PLAN_COLORS[plan.name] || "var(--ad-border)"}40`,
                borderTop: `3px solid ${PLAN_COLORS[plan.name] || "var(--ad-primary)"}`,
                borderRadius: 12,
                padding: 24,
                transition: "var(--ad-transition)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>
                    ₹{plan.price}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: PLAN_COLORS[plan.name] || "var(--ad-primary)",
                      textTransform: "capitalize",
                      marginTop: 2,
                    }}
                  >
                    {plan.name} Pack
                  </div>
                </div>
                <button
                  className="ad-btn ad-btn--ghost ad-btn--sm"
                  onClick={() => openEdit(plan)}
                >
                  Edit
                </button>
              </div>

              {[
                { label: "HD Lessons", val: plan.hd_lessons },
                { label: "Official Exams", val: plan.official_exams },
                { label: "Practice Questions", val: plan.practice_questions },
                { label: "Free Books", val: plan.free_books },
                { label: "Quizzes", val: plan.has_quizzes ? "✓ Yes" : "✗ No" },
                {
                  label: "In-depth Explanation",
                  val: plan.has_explanations ? "✓ Yes" : "✗ No",
                },
                {
                  label: "Personal Instructor",
                  val: plan.has_instructor ? "✓ Yes" : "✗ No",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--ad-border)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--ad-muted)" }}>{row.label}</span>
                  <span
                    style={{
                      color: String(row.val).startsWith("✗")
                        ? "var(--ad-muted)"
                        : "var(--ad-light)",
                      fontWeight: 600,
                    }}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Plan Modal */}
      <AdminModal
        open={!!editPlan}
        title={`Edit ${editPlan?.name?.charAt(0).toUpperCase() + editPlan?.name?.slice(1)} Plan`}
        onClose={() => setEditPlan(null)}
        footer={
          <>
            <button
              className="ad-btn ad-btn--ghost"
              onClick={() => setEditPlan(null)}
            >
              Cancel
            </button>
            <button className="ad-btn ad-btn--primary" onClick={handleSave}>
              Save Changes
            </button>
          </>
        }
      >
        <div className="ad-form-group">
          <label className="ad-form-label">Price ($)</label>
          <input
            className="ad-form-input"
            name="price"
            type="number"
            value={form.price || ""}
            onChange={onFC}
          />
        </div>
        <div className="ad-form-grid2">
          <div className="ad-form-group">
            <label className="ad-form-label">HD Lessons</label>
            <input
              className="ad-form-input"
              name="hd_lessons"
              type="number"
              value={form.hd_lessons || ""}
              onChange={onFC}
            />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Official Exams</label>
            <input
              className="ad-form-input"
              name="official_exams"
              type="number"
              value={form.official_exams || ""}
              onChange={onFC}
            />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Practice Questions</label>
            <input
              className="ad-form-input"
              name="practice_questions"
              type="number"
              value={form.practice_questions || ""}
              onChange={onFC}
            />
          </div>
          <div className="ad-form-group">
            <label className="ad-form-label">Free Books</label>
            <input
              className="ad-form-input"
              name="free_books"
              type="number"
              value={form.free_books || ""}
              onChange={onFC}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 4,
          }}
        >
          {[
            { key: "has_quizzes", label: "Include Quizzes & Assignments" },
            { key: "has_explanations", label: "Include In-depth Explanations" },
            { key: "has_instructor", label: "Include Personal Instructor" },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                color: "var(--ad-light)",
              }}
            >
              <input
                type="checkbox"
                name={item.key}
                checked={!!form[item.key]}
                onChange={onFC}
                style={{
                  accentColor: "var(--ad-primary)",
                  width: 16,
                  height: 16,
                }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </AdminModal>
    </>
  );
};
