import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
  FiEyeOff
} from "react-icons/fi";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser
} from "../../api/users";

const emptyForm = {
  login: "",
  email: "",
  password: ""
};

function getInitials(login, email) {
  const source = login || email || "U";

  return source
    .slice(0, 2)
    .toUpperCase();
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: ""
  });

  const [loading, setLoading] = useState(false);

  const isCreateModal = modalMode === "create";
  const isEditModal = modalMode === "edit";
  const isDeleteModal = modalMode === "delete";
  const isFormModal = isCreateModal || isEditModal;

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

  function openCreateModal() {
    setSelectedUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setMessage({ type: "", text: "" });
    setModalMode("create");
  }

  function openEditModal(user) {
    setSelectedUser(user);

    setForm({
      login: user.login,
      email: user.email,
      password: ""
    });

    setShowPassword(false);
    setMessage({ type: "", text: "" });
    setModalMode("edit");
  }

  function openDeleteModal(user) {
    setSelectedUser(user);
    setMessage({ type: "", text: "" });
    setModalMode("delete");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setMessage({ type: "", text: "" });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function getRandomIndex(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }

  function getRandomChar(chars) {
    return chars[getRandomIndex(chars.length)];
  }

  function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = getRandomIndex(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function generatePassword(length = 12) {
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const numbers = "23456789";
    const special = "!@#$%&*?";

    const allChars = lower + upper + numbers + special;

    const passwordChars = [
      getRandomChar(lower),
      getRandomChar(upper),
      getRandomChar(numbers),
      getRandomChar(special)
    ];

    for (let i = passwordChars.length; i < length; i += 1) {
      passwordChars.push(getRandomChar(allChars));
    }

    return shuffleArray(passwordChars).join("");
  }

  function handleGeneratePassword() {
    const newPassword = generatePassword(12);

    setForm((prev) => ({
      ...prev,
      password: newPassword
    }));

    setShowPassword(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (isCreateModal) {
        await createUser(form);

        setMessage({
          type: "success",
          text: "Пользователь создан"
        });
      }

      if (isEditModal && selectedUser) {
        const updateData = {
          login: form.login,
          email: form.email
        };

        if (form.password.trim()) {
          updateData.password = form.password;
        }

        await updateUser(selectedUser.id, updateData);

        setMessage({
          type: "success",
          text: "Пользователь обновлён"
        });
      }

      await loadUsers();
      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selectedUser) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await deleteUser(selectedUser.id);
      await loadUsers();
      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Пользователи</h2>
          <p>
            Управление пользователями админ-панели.
          </p>
        </div>

        <button
          className="button user-create-button"
          type="button"
          onClick={openCreateModal}
        >
          <FiPlus />
          Создать пользователя
        </button>
      </div>

      {message.text && !modalMode && (
        <p className={`form-message ${message.type}`}>
          {message.text}
        </p>
      )}

      <div className="table-wrapper">
        <table className="admin-table users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Почта</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>

                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {getInitials(user.login, user.email)}
                    </div>

                    <div>
                      <b>{user.login}</b>
                      <span>Логин пользователя</span>
                    </div>
                  </div>
                </td>

                <td>{user.email}</td>

                <td>
                  {new Date(user.created_at).toLocaleString("ru-RU")}
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      className="icon-button"
                      type="button"
                      title="Редактировать"
                      onClick={() => openEditModal(user)}
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className="icon-button danger"
                      type="button"
                      title="Удалить"
                      onClick={() => openDeleteModal(user)}
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

      {isFormModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="modal-close"
              type="button"
              onClick={closeModal}
            >
              <FiX />
            </button>

            <div className="modal-header">
              <h3>
                {isCreateModal
                  ? "Создать пользователя"
                  : "Редактировать пользователя"}
              </h3>

              <p>
                {isCreateModal
                  ? "Заполните данные нового пользователя."
                  : "Измените данные пользователя. Пароль можно оставить пустым."}
              </p>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
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

                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={
                      isEditModal
                        ? "Оставьте пустым, если не менять"
                        : "Минимум 6 символов"
                    }
                    value={form.password}
                    onChange={handleChange}
                  />

                  <button
                    className="password-eye-button"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </label>

              <button
                className="generate-password-button"
                type="button"
                onClick={handleGeneratePassword}
              >
                <FiRefreshCw />
                Сгенерировать пароль
              </button>

              {message.text && (
                <p className={`form-message ${message.type}`}>
                  {message.text}
                </p>
              )}

              <div className="modal-actions">
                <button
                  className="button modal-save-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Сохранение..."
                    : isCreateModal
                      ? "Создать"
                      : "Сохранить"}
                </button>

                <button
                  className="button modal-cancel-button"
                  type="button"
                  onClick={closeModal}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card delete-modal">
            <button
              className="modal-close"
              type="button"
              onClick={closeModal}
            >
              <FiX />
            </button>

            <div className="delete-modal-icon">
              <FiAlertTriangle />
            </div>

            <div className="modal-header center">
              <h3>Удалить пользователя?</h3>

              <p>
                Вы действительно хотите удалить пользователя{" "}
                <b>{selectedUser.login}</b>? Это действие нельзя отменить.
              </p>
            </div>

            {message.text && (
              <p className={`form-message ${message.type}`}>
                {message.text}
              </p>
            )}

            <div className="modal-actions center">
              <button
                className="button delete-confirm-button"
                type="button"
                disabled={loading}
                onClick={handleConfirmDelete}
              >
                {loading ? "Удаление..." : "Да, удалить"}
              </button>

              <button
                className="button modal-cancel-button"
                type="button"
                onClick={closeModal}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default UsersPage;