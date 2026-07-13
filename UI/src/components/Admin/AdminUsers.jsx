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

const ROLES = ["student", "mentor", "admin"];

const COLS = (onEdit, onDelete) => [
  {
    key: "sn",
    label: "Sn. No",
    render: (_, __, index) => (
      <span style={{ fontWeight: 600 }}>{index + 1}</span>
    ),
  },
  {
    key: "full_name",
    label: "User",
    render: (v, r) => <AvatarCell name={v} email={r.email} avatar={r.avatar} />,
  },
  {
    key: "role",
    label: "Role",
    render: (v) => (
      <span
        className={`ad-pill ad-pill--dot ad-pill--${v === "admin" ? "danger" : v === "mentor" ? "info" : "success"}`}
      >
        {v}
      </span>
    ),
  },
  {
    key: "created_at",
    label: "Joined",
    render: (v) => (
      <span style={{ color: "var(--ad-muted)", fontSize: 12 }}>
        {new Date(v).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (_, r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="ad-btn ad-btn--ghost ad-btn--sm"
          onClick={() => onEdit(r)}
        >
          Edit
        </button>
        <button
          className="ad-btn ad-btn--danger ad-btn--sm"
          onClick={() => onDelete(r)}
        >
          Delete
        </button>
      </div>
    ),
  },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const { toast, show: showToast, clear } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    adminAPI
      .getUsers({ search, role: roleFilter, page, limit: 15 })
      .then((res) => {
        setUsers(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .catch(() => showToast("Failed to load users", "error"))
      .finally(() => setLoading(false));
  }, [search, roleFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateUser(editUser.id, {
        role: editRole,
        full_name: editUser.full_name,
      });
      showToast("User updated successfully");
      setEditUser(null);
      load();
    } catch {
      showToast("Failed to update user", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deleteUser.id);
      showToast("User deleted");
      setDeleteUser(null);
      load();
    } catch {
      showToast("Failed to delete user", "error");
    }
  };

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      <div className="admin-filters">
        <div className="admin-filter-search">
          <span style={{ color: "var(--ad-muted)" }}><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="admin-filter-select"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <div className="admin-card__title">All Users</div>
            <div className="admin-card__subtitle">{total} total users</div>
          </div>
        </div>
        <AdminTable
          columns={COLS(handleEdit, (r) => setDeleteUser(r))}
          data={users}
          loading={loading}
        />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* Edit Modal */}
      <AdminModal
        open={!!editUser}
        title={`Edit User: ${editUser?.full_name}`}
        onClose={() => setEditUser(null)}
        footer={
          <>
            <button
              className="ad-btn ad-btn--ghost"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
            <button className="ad-btn ad-btn--primary" onClick={handleSaveEdit}>
              Save Changes
            </button>
          </>
        }
      >
        <div className="ad-form-group">
          <label className="ad-form-label">Full Name</label>
          <input
            className="ad-form-input"
            value={editUser?.full_name || ""}
            onChange={(e) =>
              setEditUser((u) => ({ ...u, full_name: e.target.value }))
            }
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">Email</label>
          <input
            className="ad-form-input"
            value={editUser?.email || ""}
            disabled
            style={{ opacity: 0.5, cursor: "not-allowed" }}
          />
        </div>
        <div className="ad-form-group">
          <label className="ad-form-label">Role</label>
          <select
            className="ad-form-select"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            background: "var(--ad-surface2)",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 12,
            color: "var(--ad-muted)",
          }}
        >
          <strong style={{ color: "var(--ad-warning)" }}>⚠ Warning:</strong>{" "}
          Changing to admin grants full platform access.
        </div>
      </AdminModal>

      <ConfirmModal
        open={!!deleteUser}
        message={`Delete user "${deleteUser?.full_name}"? This action cannot be undone and will remove all their data.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
      />
    </>
  );
};

export default AdminUsers;
