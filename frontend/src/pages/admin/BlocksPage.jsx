import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiImage,
  FiInfo,
  FiLayers,
  FiLink,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUpload
} from "react-icons/fi";

import {
  deleteClientLogo,
  getAdminClientLogos,
  replaceClientLogoImage,
  updateClientLogo,
  uploadClientLogo
} from "../../api/clientLogos";

import {
  getAdminFooterSettings,
  updateAdminFooterSettings
} from "../../api/footer";

import CasesManager from "./CasesManager";


const blocks = [
  {
    id: "client-logos",
    title: "Логотипы компаний",
    description:
      "Загрузка и управление логотипами компаний в бегущей строке на главной странице.",
    icon: FiImage
  },
  {
    id: "contacts",
    title: "Контакты",
    description:
      "Управление контактной информацией сайта: телефон, почта, адрес и ссылки.",
    icon: FiPhone
  },
  {
    id: "footer",
    title: "Футер",
    description:
      "Ссылки Instagram, Telegram и WhatsApp в нижней части сайта.",
    icon: FiLink
  },
  {
    id: "services",
    title: "Услуги",
    description:
      "Редактирование списка услуг компании, описаний и порядка отображения.",
    icon: FiLayers
  },
  {
    id: "booking",
    title: "Связаться",
    description:
      "Настройка блока связи и записи через Google Calendar.",
    icon: FiCalendar
  },
  {
    id: "cases",
    title: "Кейсы",
    description:
      "Публикация кейсов: рубрики, описание, изображения, порядок и статус отображения.",
    icon: FiBriefcase
  },
  {
    id: "about",
    title: "О нас",
    description:
      "Редактирование информации о компании, описания, преимуществ и текста блока.",
    icon: FiInfo
  }
];


function getToken() {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token")
  );
}


function ClientLogosBlock({ onBack }) {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");

  const token = getToken();

  async function loadLogos() {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminClientLogos(token);
      setLogos(data);
    } catch (error) {
      console.error(error);
      setMessage("Не удалось загрузить логотипы. Проверь авторизацию и backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Введите название компании");
      return;
    }

    if (!file) {
      setMessage("Выберите файл логотипа");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await uploadClientLogo(token, {
        name,
        sort_order: sortOrder,
        file
      });

      setName("");
      setSortOrder("");
      setFile(null);

      event.target.reset();

      await loadLogos();

      setMessage("Логотип загружен и сохранён в облаке");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Ошибка загрузки логотипа");
    } finally {
      setSaving(false);
    }
  }

  function changeLogoField(logoId, field, value) {
    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === logoId
          ? {
              ...logo,
              [field]: value
            }
          : logo
      )
    );
  }

  async function handleSaveLogo(logo) {
    try {
      setSaving(true);
      setMessage("");

      await updateClientLogo(token, logo.id, {
        name: logo.name,
        sort_order: Number(logo.sort_order) || 0,
        is_active: Boolean(logo.is_active)
      });

      await loadLogos();

      setMessage("Изменения сохранены");
    } catch (error) {
      console.error(error);
      setMessage("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(logo) {
    try {
      setMessage("");

      await updateClientLogo(token, logo.id, {
        is_active: !logo.is_active
      });

      await loadLogos();
    } catch (error) {
      console.error(error);
      setMessage("Не удалось изменить статус логотипа");
    }
  }

  async function handleReplaceImage(logo, selectedFile) {
    if (!selectedFile) return;

    try {
      setSaving(true);
      setMessage("");

      await replaceClientLogoImage(token, logo.id, selectedFile);

      await loadLogos();

      setMessage("Логотип заменён и сохранён в облаке");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Не удалось заменить логотип");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLogo(logoId) {
    const confirmed = window.confirm(
      "Удалить логотип? Он также будет удалён из облака."
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage("");

      await deleteClientLogo(token, logoId);
      await loadLogos();

      setMessage("Логотип удалён");
    } catch (error) {
      console.error(error);
      setMessage("Не удалось удалить логотип");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Логотипы компаний</h2>
          <p>
            Здесь можно загрузить логотипы компаний. Они сохраняются в Cloudinary
            и отображаются в бегущей строке на главной странице.
          </p>
        </div>

        <button
          className="admin-button admin-button-light"
          type="button"
          onClick={onBack}
        >
          <FiArrowLeft />
          Назад
        </button>
      </div>

      <form className="logo-upload-form" onSubmit={handleUpload}>
        <div className="logo-upload-grid">
          <label>
            Название компании
            <input
              type="text"
              placeholder="Например: Vivacell"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            Порядок
            <input
              type="number"
              placeholder="10"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </label>

          <label>
            Файл логотипа
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
        </div>

        <button
          className="admin-button logo-upload-button"
          type="submit"
          disabled={saving}
        >
          <FiUpload />
          {saving ? "Загрузка..." : "Загрузить логотип"}
        </button>
      </form>

      {message && <p className="logo-manager-message">{message}</p>}

      {loading ? (
        <p>Загрузка логотипов...</p>
      ) : logos.length === 0 ? (
        <div className="logo-empty-state">
          <FiImage />
          <h3>Логотипов пока нет</h3>
          <p>Загрузи первый логотип, и он появится на главной странице.</p>
        </div>
      ) : (
        <div className="logo-list">
          {logos.map((logo) => (
            <div
              className={logo.is_active ? "logo-row" : "logo-row logo-row-disabled"}
              key={logo.id}
            >
              <div className="logo-row-preview">
                <img src={logo.image_url} alt={logo.name} />
              </div>

              <div className="logo-row-fields">
                <label>
                  Название
                  <input
                    type="text"
                    value={logo.name}
                    onChange={(event) =>
                      changeLogoField(logo.id, "name", event.target.value)
                    }
                  />
                </label>

                <label>
                  Порядок
                  <input
                    type="number"
                    value={logo.sort_order}
                    onChange={(event) =>
                      changeLogoField(logo.id, "sort_order", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="logo-row-actions">
                <button
                  className="admin-button admin-button-light"
                  type="button"
                  onClick={() => handleToggleActive(logo)}
                >
                  {logo.is_active ? "Скрыть" : "Показать"}
                </button>

                <label className="admin-button admin-button-light logo-replace-button">
                  <FiRefreshCw />
                  Заменить
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={(event) =>
                      handleReplaceImage(logo, event.target.files?.[0] || null)
                    }
                  />
                </label>

                <button
                  className="admin-button"
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveLogo(logo)}
                >
                  <FiSave />
                  Сохранить
                </button>

                <button
                  className="admin-button logo-delete-button"
                  type="button"
                  disabled={saving}
                  onClick={() => handleDeleteLogo(logo.id)}
                >
                  <FiTrash2 />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


function FooterSettingsBlock({ onBack }) {
  const [form, setForm] = useState({
    instagram_url: "",
    telegram_url: "",
    whatsapp_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = getToken();

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        setLoading(true);
        setMessage("");

        const data = await getAdminFooterSettings(token);
        if (!active) return;

        setForm({
          instagram_url: data?.instagram_url || "",
          telegram_url: data?.telegram_url || "",
          whatsapp_url: data?.whatsapp_url || ""
        });
      } catch (error) {
        if (active) {
          setMessage(error.message || "Не удалось загрузить настройки футера");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, [token]);

  function changeField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const saved = await updateAdminFooterSettings(token, form);
      setForm({
        instagram_url: saved?.instagram_url || "",
        telegram_url: saved?.telegram_url || "",
        whatsapp_url: saved?.whatsapp_url || ""
      });
      setMessage("Ссылки футера сохранены и уже доступны на сайте");
    } catch (error) {
      setMessage(error.message || "Не удалось сохранить ссылки футера");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Футер</h2>
          <p>
            Добавьте ссылки на социальные сети. Пустое поле оставит кнопку
            видимой, но отключит переход.
          </p>
        </div>

        <button
          className="admin-button admin-button-light"
          type="button"
          onClick={onBack}
        >
          <FiArrowLeft />
          Назад
        </button>
      </div>

      {loading ? (
        <p className="footer-settings-status">Загрузка настроек...</p>
      ) : (
        <form className="seo-form footer-settings-form" onSubmit={handleSubmit}>
          <div className="seo-form-grid">
            <label>
              Instagram
              <input
                type="text"
                value={form.instagram_url}
                placeholder="https://instagram.com/chondo.group"
                onChange={(event) =>
                  changeField("instagram_url", event.target.value)
                }
              />
              <small>Можно вставить полную ссылку или @username.</small>
            </label>

            <label>
              Telegram
              <input
                type="text"
                value={form.telegram_url}
                placeholder="https://t.me/chondo_group"
                onChange={(event) =>
                  changeField("telegram_url", event.target.value)
                }
              />
              <small>Можно вставить полную ссылку или @username.</small>
            </label>

            <label>
              WhatsApp
              <input
                type="text"
                value={form.whatsapp_url}
                placeholder="+7 700 000 00 00 или https://wa.me/77000000000"
                onChange={(event) =>
                  changeField("whatsapp_url", event.target.value)
                }
              />
              <small>Номер автоматически преобразуется в ссылку WhatsApp.</small>
            </label>
          </div>

          <div className="footer-settings-actions">
            <button className="admin-button" type="submit" disabled={saving}>
              <FiSave />
              {saving ? "Сохранение..." : "Сохранить ссылки"}
            </button>
          </div>
        </form>
      )}

      {message && <p className="logo-manager-message">{message}</p>}
    </section>
  );
}


function BlocksPage() {
  const [activeBlock, setActiveBlock] = useState(null);

  if (activeBlock === "client-logos") {
    return <ClientLogosBlock onBack={() => setActiveBlock(null)} />;
  }

  if (activeBlock === "cases") {
    return <CasesManager onBack={() => setActiveBlock(null)} />;
  }

  if (activeBlock === "footer") {
    return <FooterSettingsBlock onBack={() => setActiveBlock(null)} />;
  }

  if (activeBlock) {
    return (
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Раздел в разработке</h2>
            <p>Этот блок можно подключить следующим этапом.</p>
          </div>

          <button
            className="admin-button admin-button-light"
            type="button"
            onClick={() => setActiveBlock(null)}
          >
            <FiArrowLeft />
            Назад
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>Блоки сайта</h2>
          <p>Выберите блок сайта, который нужно отредактировать.</p>
        </div>
      </div>

      <div className="blocks-list">
        {blocks.map((block) => {
          const Icon = block.icon;

          return (
            <button
              key={block.id}
              className="block-item"
              type="button"
              onClick={() => {
                setActiveBlock(block.id);
              }}
            >
              <div className="block-item-left">
                <div className="block-item-icon">
                  <Icon />
                </div>

                <div>
                  <h3>{block.title}</h3>
                  <p>{block.description}</p>
                </div>
              </div>

              <FiArrowRight className="block-item-arrow" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BlocksPage;