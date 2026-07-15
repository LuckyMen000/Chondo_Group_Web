import { useEffect, useRef } from "react";

function LeadSuccessModal({ isOpen, onClose }) {
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    previousActiveElementRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElementRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="lead-modal-overlay" onMouseDown={handleOverlayClick}>
      <section
        className="lead-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        aria-describedby="lead-modal-description"
      >
        <button
          ref={closeButtonRef}
          className="lead-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Закрыть сообщение"
        >
          ×
        </button>

        <span className="lead-modal-icon" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">Заявка отправлена</p>
        <h2 id="lead-modal-title">Спасибо! Мы получили ваши данные</h2>
        <p id="lead-modal-description">
          Мы уже передали запрос команде. Изучим вашу задачу и свяжемся по
          указанному номеру в ближайшее время. Пожалуйста, убедитесь, что этот
          номер доступен в WhatsApp.
        </p>

        <button
          className="button lead-modal-button"
          type="button"
          onClick={onClose}
        >
          Хорошо
        </button>
      </section>
    </div>
  );
}

export default LeadSuccessModal;
