"""
Django settings for quiz_project project.
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-o&s-arrd_@j+=#*ex4l&d#hysf2ls6f=(#1y40ik06nr5z+-or'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.2.100',
    '0.0.0.0',
    'quiz.dolgovst.keenetic.pro',      # Фронтенд домен
    'quiz-back.dolgovst.keenetic.pro',  # Бэкенд домен
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Наши приложения
    'quiz_app',
    'rest_framework',
    'corsheaders',  # ВАЖНО: должен быть установлен
    'channels',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ВАЖНО: должен быть ПЕРВЫМ
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'quiz_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ASGI для WebSocket
ASGI_APPLICATION = 'quiz_project.asgi.application'

# Channels настройки
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework настройки
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}

# ============================================================================
# CORS НАСТРОЙКИ - КРИТИЧЕСКИ ВАЖНО ДЛЯ РАБОТЫ С ВНЕШНИМИ ДОМЕНАМИ
# ============================================================================

# Разрешаем запросы с любых источников (для dev окружения)
CORS_ALLOW_ALL_ORIGINS = True

# Разрешаем credentials (cookies, авторизация)
CORS_ALLOW_CREDENTIALS = True

# Разрешаем все HTTP методы
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Разрешаем все заголовки
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Для продакшена лучше использовать конкретный список доменов:
# CORS_ALLOW_ALL_ORIGINS = False
# CORS_ALLOWED_ORIGINS = [
#     "http://quiz.dolgovst.keenetic.pro",
#     "http://192.168.2.100:5173",
#     "http://localhost:5173",
# ]

# ============================================================================
# OpenAI / LLM настройки
# ============================================================================

try:
    from decouple import config, UndefinedValueError
    OPENAI_API_KEY = config('OPENAI_API_KEY')
    OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-4-turbo')
    OPENAI_API_BASE = None
except:
    # Для локальной MLC LLM
    OPENAI_API_KEY = "not-needed"
    OPENAI_API_BASE = "http://localhost:8080/v1"
    OPENAI_MODEL = "Llama-3-8B-Instruct-q4f16_1-MLC"

# Кеширование
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}