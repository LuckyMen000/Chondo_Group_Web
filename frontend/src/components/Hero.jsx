function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">digital / product / development</p>

          <h1>Создаём цифровые продукты для роста бизнеса</h1>

          <p className="hero__text">
            Chondo Group помогает компаниям запускать сайты, платформы,
            CRM-системы, мобильные приложения и digital-инструменты под ключ.
          </p>

          <div className="hero__actions">
            <a href="#contact" className="button hero__button-primary">
              у меня есть задача
            </a>

            <a href="#cases" className="button hero__button-secondary">
              смотреть кейсы
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;