from fastapi import APIRouter, HTTPException, status

from app.services.telegram import get_telegram_updates, send_telegram_message


router = APIRouter(
    prefix="/api/telegram",
    tags=["Telegram"]
)


@router.get("/updates")
def telegram_updates():
    data = get_telegram_updates()

    if not data.get("ok"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=data
        )

    return data


@router.post("/test")
def telegram_test():
    ok = send_telegram_message(
        "✅ <b>Тестовое уведомление Chondo Group</b>\n\nTelegram-бот подключен успешно."
    )

    if not ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось отправить сообщение в Telegram. Проверь TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID."
        )

    return {
        "ok": True,
        "message": "Тестовое сообщение отправлено в Telegram"
    }