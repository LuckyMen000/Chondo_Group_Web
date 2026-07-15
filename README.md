# Chondo Group

## Локальный запуск backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Локальный запуск frontend

```bash
cd frontend
npm install
npm start
```

## Переменные окружения frontend

Для локальной разработки:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Для production обязательно укажите публичный URL backend в настройках хостинга:

```env
REACT_APP_API_URL=https://api.example.kz/api
```

Публичные блоки «Логотипы компаний» и «Кейсы» загружаются без авторизации. После изменения в админке посетители получают актуальные активные записи без кэширования. Скрытые записи (`is_active = false`) на публичном сайте не отображаются.

`FRONTEND_URL` в backend поддерживает несколько адресов через запятую. Vercel preview-домены разрешены автоматически.

## Страницы услуг

Карточки услуг на главной открывают отдельные публичные страницы:

- `/services/development`
- `/services/digital-marketing`
- `/services/expert-promotion`
- `/services/funnels`
- `/services/ux-ui`
- `/services/production`

Для прямого открытия этих URL на Vercel в `frontend/vercel.json` добавлен SPA rewrite на `index.html`.

## Кейсы на страницах услуг

Каждая страница услуги показывает опубликованные кейсы из соответствующей рубрики админки:

- Разработка → `development`
- Digital Marketing → `digital`
- Продвижение экспертов → `experts`
- Автоворонки → `funnels`
- UX/UI → `uxui`
- Видео и подкасты → `podcasts`

Чтобы кейс появился на странице услуги, выберите нужную рубрику и включите статус публикации в админке. Публичный endpoint возвращает только активные кейсы.

## Форма заявки

Поле контакта называется «Номер для связи». Пользователю показывается подсказка, что номер должен быть доступен в WhatsApp. После успешной отправки открывается модальное окно с подтверждением.

Реальные файлы `.env` не следует добавлять в архив или репозиторий. Используйте `backend/.env.example` и `frontend/.env.example` как шаблоны.

### Ссылки футера

В админ-панели откройте `Блоки сайта → Футер`. Можно указать полные ссылки, `@username` для Instagram/Telegram или номер WhatsApp. Пустое поле отключает переход у соответствующей кнопки.
