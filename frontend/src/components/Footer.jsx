import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
  FaEnvelope,
  FaExternalLinkAlt,
  FaShieldAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner footer__inner-new">
        <div className="footer__brand">
          <p className="footer__kicker">digital / product / development</p>

          <a href="#hero" className="footer__logo">
            Chondo Group
          </a>

          <p className="footer__description">
            Проектируем и запускаем цифровые продукты: сайты, CRM-системы,
            платформы, мобильные интерфейсы и автоматизации для роста бизнеса.
          </p>

          <div className="footer__tags">
            <span>Web development</span>
            <span>CRM</span>
            <span>Automation</span>
            <span>UI/UX</span>
          </div>

          <div className="footer__admin-card">
            <span className="footer__admin-icon">
              <FaShieldAlt />
            </span>

            <p>
              Техническое сопровождение, администрирование и развитие цифровой
              инфраструктуры выполняет ТОО «Солтрикс».
            </p>
          </div>

          <a href="#contact" className="footer__cta">
            Обсудить проект
            <FaExternalLinkAlt />
          </a>
        </div>

        <div className="footer__nav">
          <h4>Навигация</h4>

          <a href="#about">О нас</a>
          <a href="#services">Услуги</a>
          <a href="#cases">Кейсы</a>
          <a href="#contact">Контакты</a>
        </div>

        <div className="footer__socials">
          <h4>Связаться</h4>

          <div className="footer__social-list">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="footer__social-link"
              aria-label="Instagram"
            >
              <span>
                <FaInstagram />
              </span>
              Instagram
            </a>

            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="footer__social-link"
              aria-label="Telegram"
            >
              <span>
                <FaTelegramPlane />
              </span>
              Telegram
            </a>

            <a
              href="https://wa.me/77000000000"
              target="_blank"
              rel="noreferrer"
              className="footer__social-link"
              aria-label="WhatsApp"
            >
              <span>
                <FaWhatsapp />
              </span>
              WhatsApp
            </a>

            <a
              href="mailto:hello@chondo.group"
              className="footer__social-link"
              aria-label="Email"
            >
              <span>
                <FaEnvelope />
              </span>
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© 2026 Chondo Group. Все права защищены.</p>
        <p>Digital solutions for business</p>
      </div>
    </footer>
  );
}

export default Footer;