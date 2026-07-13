const services = [
  {
    title: "Development",
    text: "Разрабатываем сайты, платформы, личные кабинеты и веб-приложения под задачи бизнеса.",
  },
  {
    title: "CRM Systems",
    text: "Проектируем и внедряем CRM-системы, админ-панели, реестры заявок и внутренние сервисы.",
  },
  {
    title: "UI/UX Design",
    text: "Создаём понятные интерфейсы, которые помогают пользователю быстро дойти до нужного действия.",
  },
  {
    title: "Automation",
    text: "Автоматизируем заявки, уведомления, отчёты, интеграции и повторяющиеся бизнес-процессы.",
  },
  {
    title: "Analytics",
    text: "Подключаем аналитику, события, цели, отчёты и понятные дашборды для принятия решений.",
  },
];

function Services() {
  return (
    <section className="section section-dark" id="services">
      <div className="container">
        <p className="eyebrow">услуги</p>
        <h2>Что мы делаем</h2>

        <div className="cards services-grid">
          {services.map((service) => (
            <article className="card service-card" key={service.title}>
              <span className="service-card__number">/ {service.title}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;