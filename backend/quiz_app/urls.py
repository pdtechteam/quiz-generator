# ============================================================================
# ФАЙЛ 3: backend/quiz_app/urls.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Создаём роутер для автоматической генерации URL
router = DefaultRouter()
router.register(r'quizzes', views.QuizViewSet, basename='quiz')
router.register(r'sessions', views.GameSessionViewSet, basename='session')
router.register(r'players', views.PlayerViewSet, basename='player')
router.register(r'answers', views.AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
]