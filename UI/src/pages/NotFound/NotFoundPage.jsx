import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        background:
          "radial-gradient(circle at top, rgba(239, 68, 68, 0.15), transparent 45%)",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "center",
          padding: "48px 36px",
          borderRadius: 28,
          background: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          boxShadow: "0 24px 70px rgba(239, 68, 68, 0.15)",
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            margin: "0 auto 22px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" />
        </div>

        <h1
          style={{
            fontSize: 92,
            color: "#EF4444",
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: 26, marginBottom: 10 }}>
          Oops! Page Not Found
        </h2>

        <p style={{ color: "#6B7280", marginBottom: 24 }}>
          Looks like this page doesn’t exist or Moved.
        </p>

        <a
          href="/"
          style={{
            padding: "12px 24px",
            borderRadius: 999,
            background: "#EF4444",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;