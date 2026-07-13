import html
import json
import logging
import urllib.request
from datetime import datetime
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)


def _escape(value: Any) -> str:
    if value is None:
        return "—"

    text = str(value).strip()
    if not text:
        return "—"

    return html.escape(text)


def _format_datetime(value: Any) -> str:
    if not value:
        return "—"

    if isinstance(value, datetime):
        return value.strftime("%d.%m.%Y %H:%M")

    return str(value)


def telegram_is_configured() -> bool:
    return bool(
        settings.TELEGRAM_NOTIFICATIONS_ENABLED
        and settings.TELEGRAM_BOT_TOKEN
        and settings.TELEGRAM_CHAT_ID
    )


def send_telegram_message(text: str) -> bool:
    """
    Отправляет сообщение в Telegram.
    Важно: если Telegram упал или chat_id не указан, заявка всё равно должна создаться.
    Поэтому функция возвращает False, но не ломает основной процесс.
    """

    if not telegram_is_configured():
        logger.warning("Telegram notifications are not configured")
        return False

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"

    payload = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    try:
        request = urllib.request.Request(
            url=url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        with urllib.request.urlopen(request, timeout=10) as response:
            response_data = json.loads(response.read().decode("utf-8"))

        if not response_data.get("ok"):
            logger.error("Telegram error: %s", response_data)
            return False

        return True

    except Exception as exc:
        logger.exception("Failed to send Telegram message: %s", exc)
        return False


def get_telegram_updates() -> dict:
    """
    Нужно для получения chat_id.
    Сначала напиши боту /start, потом дерни /api/telegram/updates.
    """

    if not settings.TELEGRAM_BOT_TOKEN:
        return {
            "ok": False,
            "error": "TELEGRAM_BOT_TOKEN is not configured",
        }

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getUpdates"

    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))

    except Exception as exc:
        logger.exception("Failed to get Telegram updates: %s", exc)
        return {
            "ok": False,
            "error": str(exc),
        }


def format_new_lead_message(lead: Any) -> str:
    return "\n".join(
        [
            "🔥 <b>Новая заявка с сайта Chondo Group</b>",
            "",
            f"🆔 <b>ID:</b> {_escape(lead.id)}",
            f"👤 <b>Имя:</b> {_escape(lead.name)}",
            f"📧 <b>Email:</b> {_escape(lead.email)}",
            f"📞 <b>Телефон:</b> {_escape(lead.phone)}",
            f"💬 <b>Сообщение:</b> {_escape(lead.message)}",
            f"🕒 <b>Дата:</b> {_escape(_format_datetime(lead.created_at))}",
        ]
    )