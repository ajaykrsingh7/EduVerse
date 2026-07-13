import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input, Alert } from "../../components/Base";
import Button from "../../components/UI/Button/Button";
import "./Auth.css";
import authImg from "../../assets/auth.png";

<div className="auth-modal__left">
  <img src={authImg} alt="auth" />
</div>;

//Login
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        {/* Left panel */}
        <div className="auth-modal__left">
          <Link to="/" className="auth-logo">
            <span>
              <span>
                <i className="fa-solid fa-graduation-cap" />
              </span>
            </span>
            <span>EduVerse</span>
          </Link>
          <h1 className="auth-heading">
            Welcome to
            <br />
            EduVerse Online
            <br />
            Learning Platform
          </h1>
          <img src={authImg} alt="auth" />
        </div>

        {/* Right panel */}
        <div className="auth-modal__right">
          <Alert type="error" message={error} />

          <button className="google-btn">
            <span className="google-icon">
              <i className="fa-brands fa-google" />
            </span>
            Sign in with Google
          </button>

          <div className="auth-divider">
            <span>Or signin with your email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="bill.sanders@example.com"
              icon={<i className="fa-solid fa-envelope" />}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••••••"
              icon={<i className="fa-solid fa-lock" />}
              required
            />

            <div className="auth-options">
              <label className="auth-checkbox">
                <input type="checkbox" /> keep me signed in
              </label>
              <Link to="/forgot-password" className="auth-forgot">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* Register  */
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    agreed: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreed) {
      setError("Please agree to the Terms & Conditions");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        {/* Left panel */}
        <div className="auth-modal__left">
          <Link to="/" className="auth-logo">
            <span>
              <span>
                <i className="fa-solid fa-graduation-cap" />
              </span>
            </span>
            <span>EduVerse</span>
          </Link>
          <h1 className="auth-heading">
            Welcome to
            <br />
            EduVerse Online
            <br />
            Learning Platform
          </h1>
          <img src={authImg} alt="auth" />
        </div>

        {/* Right panel */}
        <div className="auth-modal__right">
          <Alert type="error" message={error} />

          <button className="google-btn">
            <span className="google-icon">
              <i className="fa-brands fa-google" />
            </span>
            Sign in with Google
          </button>

          <div className="auth-divider">
            <span>Or signup with your email </span>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Esther Howard"
              icon={<i className="fa-solid fa-user" />}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="bill.sanders@example.com"
              icon={<i className="fa-solid fa-envelope" />}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••••••"
              icon={<i className="fa-solid fa-lock" />}
              required
            />

            <label className="auth-checkbox" style={{ marginBottom: 20 }}>
              <input
                type="checkbox"
                name="agreed"
                checked={form.agreed}
                onChange={onChange}
              />
              I agreed to the Terms &amp; Conditions
            </label>

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Sign Up
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

