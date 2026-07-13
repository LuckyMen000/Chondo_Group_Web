import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import { loginUser } from "../api/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      localStorage.setItem("admin_token", data.access_token);

      navigate("/admin");
    } catch (error) {
      setError("Неверная почта или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <h1>CG</h1>
          <p>Admin Panel</p>
        </div>

        <label className="input-group">
          Почта
          <div className="input-wrap">
            <FiMail className="input-icon" />

            <input
              type="email"
              name="email"
              placeholder="admin@chondo.kz"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </label>

        <label className="input-group">
          Пароль
          <div className="input-wrap">
            <FiLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Введите пароль"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="button"
              className="password-eye"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </label>

        {error && (
          <p className="form-message error">
            {error}
          </p>
        )}

        <button className="button login-button" type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;