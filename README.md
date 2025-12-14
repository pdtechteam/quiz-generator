# Quiz Generator

Домашняя квиз-игра в стиле Kahoot с генерацией вопросов через LLM.

## Быстрый старт

### 1. Активация окружения

```bash
conda activate quiz-generator
```

### 2. Запуск backend

```bash
cd backend
python manage.py runserver
```

### 3. Django Admin

Открой http://127.0.0.1:8000/admin/

## Структура проекта

```
quiz-generator/
├── backend/          # Django backend
├── frontend/         # React frontend
└── README.md
```

## Технологии

- **Backend:** Django 5.0, Channels, OpenAI API
- **Frontend:** React 18, Tailwind CSS
- **Database:** SQLite (dev), PostgreSQL (prod)
- **WebSocket:** Redis + Channels

## Разработка

### Создание миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

### Создание суперпользователя

```bash
python manage.py createsuperuser
```

### Запуск Redis (для WebSocket)

```bash
# Через Docker
docker run -p 6379:6379 redis:alpine

# Или установить локально
```

## TODO

- [ ] Настроить WebSocket
- [ ] Создать React компоненты
- [ ] Добавить звуки
- [ ] Подготовить картинки для тем