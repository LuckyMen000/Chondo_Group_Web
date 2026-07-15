import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const sectionLink = (hash) => (isHome ? hash : `/${hash}`);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo">
          Chondo Group
        </Link>

        <nav className="nav" aria-label="Основная навигация">
          <Link to={sectionLink("#about")}>О нас</Link>
          <Link to={sectionLink("#services")}>Услуги</Link>
          <Link to={sectionLink("#cases")}>Кейсы</Link>
          <Link to={sectionLink("#contact")}>Контакты</Link>
        </nav>

        <Link to={sectionLink("#contact")} className="header__button">
          Обсудить проект
        </Link>
      </div>
    </header>
  );
}

export default Header;
