# ============================================================================
# ФАЙЛ 2: backend/quiz_app/routing.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<code>\w+)/$', consumers.GameConsumer.as_asgi()),
]