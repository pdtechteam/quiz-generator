# ============================================================================
# ФАЙЛ 4: backend/quiz_project/urls.py (ОТРЕДАКТИРУЙ)
# ============================================================================
# 
# Открой файл backend/quiz_project/urls.py
# И ЗАМЕНИ его содержимое на это:

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('quiz_app.urls')),  # ← ДОБАВЬ ЭТУ СТРОКУ
]