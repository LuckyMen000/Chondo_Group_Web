import { useCallback, useState } from "react";

import { createLead } from "../api/leads";
import LeadSuccessModal from "./LeadSuccessModal";

const initialForm = {
  name: "",
  phone: "",
  message: ""
};

function ContactForm({ serviceName = "" }) {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateForm() {
    if (form.name.trim().length < 2) {
      return "Введите имя";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return "Введите корректный номер для связи";
    }

    return "";
  }

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const message = [
      serviceName ? `Интересует услуга: ${serviceName}.` : "",
      form.message.trim()
    ]
      .filter(Boolean)
      .join(" ");

    try {
      await createLead({
        name: form.name.trim(),
        phone: form.phone.trim(),
        message
      });

      setForm(initialForm);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Ошибка отправки заявки:", error);
      setErrorMessage(
        "Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="section contact" id="contact">
        <div className="container grid-2">
          <div>
            <p className="eyebrow">Обсудить проект</p>
            <h2>Разберём вашу задачу</h2>
            <p>
              Оставьте контакт. В течение рабочего дня изучим запрос и предложим
              подходящий формат работы и первые шаги.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label>
              Имя
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Как к вам обращаться"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Номер для связи
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+7 700 000 00 00"
                value={form.phone}
                onChange={handleChange}
                aria-describedby="phone-hint"
                required
              />
              <span className="form-field-hint" id="phone-hint">
                Укажите номер, к которому привязан WhatsApp.
              </span>
            </label>

            <label>
              Кратко о задаче
              <textarea
                name="message"
                placeholder="Например: нужен запуск эксперта, CRM, продвижение или видеопродакшн"
                value={form.message}
                onChange={handleChange}
              />
            </label>

            {errorMessage && (
              <p className="form-message error" role="alert" aria-live="polite">
                {errorMessage}
              </p>
            )}

            <button
              className="button"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Отправка..." : "Получить разбор"}
            </button>

            <p className="form-consent">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        </div>
      </section>

      <LeadSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
      />
    </>
  );
}

export default ContactForm;
