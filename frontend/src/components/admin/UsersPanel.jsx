import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser
} from "../../api/users";

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);

  const [form, setForm] = useState({
    login: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState({
    type: "",
    text: ""
  });

  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function resetForm() {
    setEditingUserId(null);
    setForm({
      login: "",
      email: "",
      password: ""
    });
    setMessage({
      type: "",
      text: ""
    });
  }

  function startEdit(user) {
    setEditingUserId(user.id);
    setForm({
      login: user.login,
      email: user.email,
      password: ""
    });
    setMessage({
      type: "",
      text: ""
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage({
      type: "",
      text: ""
    });

    try {
      if (editingUserId) {
        const updateData = {
          login: form.login,
          email: form.email
        };

        if (form.password.trim()) {
          updateData.password = form.password;
        }

        await updateUser(editingUserId, updateData);

        setMessage({
          type: "success",
          text: "Пользователь обновлён"
        });
      } else {
        await createUser(form);

        setMessage({
          type: "success",
          text: "Пользователь создан"
        });
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId) {
    const confirmDelete = window.confirm("Удалить пользователя?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteUser(userId);
      await loadUsers();

      setMessage({
        type: "success",
        text: "Пользователь удалён"
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Пользователи</h2>
          <p>Создание, редактирование и удаление пользователей админ-панели.</p>
        </div>
      </div>

      <form className="user-form" onSubmit={handleSubmit}>
        <div className="user-form-grid">
          <label>
            Логин
            <input
              type="text"
              name="login"
              placeholder="admin"
              value={form.login}
              onChange={handleChange}
            />
          </label>

          <label>
            Почта
            <input
              type="email"
              name="email"
              placeholder="admin@chondo.kz"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              name="password"
              placeholder={editingUserId ? "Оставьте пустым, если не менять" : "Минимум 6 символов"}
              value={form.password}
              onChange={handleChange}
            />
          </label>
        </div>

        {message.text && (
          <p className={`form-message ${message.type}`}>
            {message.text}
          </p>
        )}

        <div className="user-form-actions">
          <button className="button user-save-button" type="submit" disabled={loading}>
            <FiPlus />
            {loading
              ? "Сохранение..."
              : editingUserId
                ? "Сохранить изменения"
                : "Создать пользователя"}
          </button>

          {editingUserId && (
            <button
              className="button user-cancel-button"
              type="button"
              onClick={resetForm}
            >
              <FiX />
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Логин</th>
              <th>Почта</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.login}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleString("ru-RU")}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => startEdit(user)}
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="5">Пользователей пока нет.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UsersPanel;