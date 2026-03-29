import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      await handleLogin(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-wrap">
      <img
        className="edge-confetti"
        src="./src/assets/back1.png"
        alt=""
      />

      <div className="auth-page">
        <div className="auth-card">
          <h1>Admin Login</h1>
          <p className="muted">Sign in to manage nominees and view the dashboard.</p>

          <form onSubmit={onSubmit}>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="admin@email.com"
            />

            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
            />

            <button className="secondary-small" type="submit">
              Login
            </button>

            {error && <p className="error-text">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;