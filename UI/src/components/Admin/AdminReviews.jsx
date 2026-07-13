import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../../services/adminApi";
import api from "../../services/api";
import {
  AdminTable,
  AdminPagination,
  ConfirmModal,
  useToast,
  Toast,
  AvatarCell,
} from "./AdminComponents";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTP] = useState(1);
  const [delReview, setDel] = useState(null);
  const { toast, show, clear } = useToast();

  // Replace the load() function:
  const load = useCallback(() => {
    setLoading(true);
    // Use admin API not the public reviews API
    api
      .get("/admin/reviews", { params: { page, limit: 15 } })
      .then((res) => {
        setReviews(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTP(res.pagination?.totalPages || 1);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [page]);

  // Fix COLS — the 'reviewer' and 'target' columns:
  const COLS = [
    {
      key: "sn",
      label: "Sn. No.",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600 }}>{index + 1}</span>
      ),
    },
    {
      key: "reviewer",
      label: "Reviewer",
      render: (v, r) => (
        <AvatarCell name={v} email={r.user_email} avatar={r.reviewer_avatar} />
      ),
    },
    {
      key: "course_title",
      label: "For",
      render: (v, r) => (
        <div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
            <i
              className={`fa-solid fa-${v ? "book" : "chalkboard-user"}`}
              style={{ marginRight: 6, color: "var(--ad-primary)" }}
            />
            {v || r.mentor_name || "—"}
          </div>
          <div style={{ color: "var(--ad-muted)", fontSize: 11, marginTop: 2 }}>
            {v ? "Course" : "Mentor"}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (v) => (
        <span style={{ display: "inline-flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <i
              key={n}
              className={`fa-${n <= v ? "solid" : "regular"} fa-star`}
              style={{ color: "#F59E0B", fontSize: 13 }}
            />
          ))}
          <span
            style={{ fontSize: 11, color: "var(--ad-muted)", marginLeft: 4 }}
          >
            ({v}/5)
          </span>
        </span>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (v) => (
        <span
          style={{
            color: "var(--ad-muted)",
            fontSize: 12,
            maxWidth: 260,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {v || <em>No comment</em>}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (v) => (
        <span
          style={{
            color: "var(--ad-muted)",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <i className="fa-regular fa-calendar" />
          {new Date(v).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
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
          Delete
        </button>
      ),
    },
  ];

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    try {
      await adminAPI.delete(`/admin/reviews/${delReview.id}`);
      show("Review deleted");
      setDel(null);
      load();
    } catch {
      show("Failed to delete review", "error");
    }
  };

  const renderStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  // Fallback: show empty state if endpoint doesn't exist yet
  if (!loading && reviews.length === 0) {
    return (
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-card__title">Reviews &amp; Ratings</div>
        </div>
        <div className="ad-empty">
          <div className="ad-empty__icon">⭐</div>
          <div className="ad-empty__text">
            No reviews yet. They will appear here once students rate courses or
            mentors.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">Reviews &amp; Ratings</div>
            <div className="admin-card__subtitle">{total} total reviews</div>
          </div>
        </div>
        <AdminTable columns={COLS} data={reviews} loading={loading} />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>
      <ConfirmModal
        open={!!delReview}
        message="Delete this review permanently? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDel(null)}
      />
    </>
  );
};

export default AdminReviews;
