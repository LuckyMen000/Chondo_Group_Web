function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#hero" className="logo">
          Chondo Group
        </a>

        <nav className="nav">
          <a href="#about">о нас</a>
          <a href="#services">услуги</a>
          <a href="#cases">кейсы</a>
          <a href="#contact">контакты</a>
        </nav>

        <a href="#contact" className="header__button">
          обсудить проект
        </a>
      </div>
    </header>
  );
}

export default Header;