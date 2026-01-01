import os
import sys
import django

# Добавляем путь к проекту
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quiz_project.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("MIDDLEWARE:")
print("=" * 60)
for i, m in enumerate(settings.MIDDLEWARE):
    print(f"{i}: {m}")

print("\n" + "=" * 60)
print("CORS settings:")
print("=" * 60)
print("CORS_ALLOWED_ORIGINS:", getattr(settings, 'CORS_ALLOWED_ORIGINS', 'НЕ НАЙДЕНО'))
print("CORS_ALLOW_ALL_ORIGINS:", getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', 'НЕ НАЙДЕНО'))
print("CORS_ALLOW_CREDENTIALS:", getattr(settings, 'CORS_ALLOW_CREDENTIALS', 'НЕ НАЙДЕНО'))

print("\n" + "=" * 60)
print("INSTALLED_APPS:")
print("=" * 60)
print("corsheaders в INSTALLED_APPS:", 'corsheaders' in settings.INSTALLED_APPS)

print("\n" + "=" * 60)
print("ALLOWED_HOSTS:")
print("=" * 60)
for host in settings.ALLOWED_HOSTS:
    print(f"  - {host}")