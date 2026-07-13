import { useState } from "react";
import { createLead } from "../api/leads";

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [status, setStatus] = useState({
    type: "",
    text: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function validateForm() {
    if (form.name.trim().length < 2) {
      return "Введите имя";
    }

    if (!form.email.trim()) {
      return "Введите email";
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Введите корректный email";
    }

    if (!form.phone.trim()) {
      return "Введите телефон";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const error = validateForm();

    if (error) {
      setStatus({
        type: "error",
        text: error
      });
      return;
    }

    setLoading(true);
    setStatus({
      type: "",
      text: ""
    });

    try {
      await createLead(form);

      setStatus({
        type: "success",
        text: "Заявка успешно отправлена. Мы свяжемся с вами."
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: "Не удалось отправить заявку. Проверьте backend."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section contact" id="contact">
      <div className="container grid-2">
        <div>
          <p className="eyebrow">Контакты</p>
          <h2>Оставьте заявку</h2>
          <p>
            Напишите нам, и мы обсудим ваш проект, сроки и подходящее решение.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Имя
            <input
              type="text"
              name="name"
              placeholder="Ваше имя"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="example@mail.com"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Телефон
            <input
              type="text"
              name="phone"
              placeholder="+7 700 000 00 00"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          <label>
            Описание проекта
            <textarea
              name="message"
              placeholder="Кратко опишите задачу"
              value={form.message}
              onChange={handleChange}
            />
          </label>

          {status.text && (
            <p className={`form-message ${status.type}`}>
              {status.text}
            </p>
          )}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;