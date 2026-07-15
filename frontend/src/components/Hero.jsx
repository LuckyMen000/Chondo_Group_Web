function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">ПРОДЮСЕРСКИЙ ЦЕНТР / MEDIA / MARKETING / IT</p>

          <h1>Медиа, маркетинг и IT-системы, которые приводят клиентов</h1>

          <p className="hero__text">
            Создаём контент, запускаем рекламу, выстраиваем автоворонки и
            разрабатываем цифровые продукты — в одной команде.
          </p>

          <div className="hero__actions">
            <a href="#contact" className="button hero__button-primary">
              Обсудить проект
            </a>

            <a href="#cases" className="button hero__button-secondary">
              Смотреть кейсы
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
