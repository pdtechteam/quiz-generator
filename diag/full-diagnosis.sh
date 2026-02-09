#!/bin/bash
# Полная диагностика Quiz Generator

echo "🔍 ПОЛНАЯ ДИАГНОСТИКА QUIZ GENERATOR"
echo "===================================="
echo ""

# 1. FRONTEND DEPENDENCIES
echo "📦 1. PACKAGE.JSON (зависимости)"
echo "-----------------------------------"
if [ -f "frontend/package.json" ]; then
    cat frontend/package.json
else
    echo "❌ frontend/package.json НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 2. NODE_MODULES
echo "📁 2. NODE_MODULES (установлены ли пакеты?)"
echo "-----------------------------------"
if [ -d "frontend/node_modules" ]; then
    echo "✅ Папка node_modules существует"
    echo "Количество пакетов: $(ls frontend/node_modules | wc -l)"
    echo ""
    echo "Ключевые пакеты:"
    ls frontend/node_modules | grep -E "^(react|tailwind|vite)" || echo "Не найдены!"
else
    echo "❌ frontend/node_modules НЕ СУЩЕСТВУЕТ! Нужно: npm install"
fi
echo ""
echo ""

# 3. TAILWIND CONFIG
echo "⚙️ 3. TAILWIND.CONFIG.JS"
echo "-----------------------------------"
if [ -f "frontend/tailwind.config.js" ]; then
    cat frontend/tailwind.config.js
else
    echo "❌ tailwind.config.js НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 4. POSTCSS CONFIG
echo "⚙️ 4. POSTCSS.CONFIG.JS"
echo "-----------------------------------"
if [ -f "frontend/postcss.config.js" ]; then
    cat frontend/postcss.config.js
else
    echo "⚠️ postcss.config.js НЕ НАЙДЕН (может быть нужен)"
fi
echo ""
echo ""

# 5. INDEX.CSS (первые 15 строк)
echo "🎨 5. INDEX.CSS (Tailwind директивы)"
echo "-----------------------------------"
if [ -f "frontend/src/index.css" ]; then
    head -15 frontend/src/index.css
else
    echo "❌ index.css НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 6. MAIN.JSX (импорты CSS)
echo "📄 6. MAIN.JSX (импорты)"
echo "-----------------------------------"
if [ -f "frontend/src/main.jsx" ]; then
    cat frontend/src/main.jsx
else
    echo "❌ main.jsx НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 7. VITE CONFIG
echo "⚙️ 7. VITE.CONFIG.JS"
echo "-----------------------------------"
if [ -f "frontend/vite.config.js" ]; then
    cat frontend/vite.config.js
else
    echo "❌ vite.config.js НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 8. ADMIN PANEL (первые 30 строк - импорты)
echo "🔧 8. ADMINPANEL.JSX (импорты и начало)"
echo "-----------------------------------"
if [ -f "frontend/src/components/Admin/AdminPanel.jsx" ]; then
    head -30 frontend/src/components/Admin/AdminPanel.jsx
else
    echo "❌ AdminPanel.jsx НЕ НАЙДЕН!"
fi
echo ""
echo ""

# 9. ВЕРСИИ
echo "📊 9. ВЕРСИИ УСТАНОВЛЕННОГО ПО"
echo "-----------------------------------"
echo "Node.js: $(node --version 2>/dev/null || echo 'НЕ УСТАНОВЛЕН')"
echo "npm: $(npm --version 2>/dev/null || echo 'НЕ УСТАНОВЛЕН')"
echo "Python: $(python --version 2>/dev/null || python3 --version 2>/dev/null || echo 'НЕ УСТАНОВЛЕН')"
echo ""
echo ""

# 10. ПРОЦЕССЫ
echo "🔄 10. ЗАПУЩЕННЫЕ ПРОЦЕССЫ"
echo "-----------------------------------"
echo "Frontend (Vite):"
ps aux | grep -i vite | grep -v grep || echo "❌ Vite НЕ ЗАПУЩЕН"
echo ""
echo "Backend (Django):"
ps aux | grep -i "manage.py runserver" | grep -v grep || echo "❌ Django НЕ ЗАПУЩЕН"
echo ""
echo ""

# 11. СТРУКТУРА ПРОЕКТА
echo "📂 11. СТРУКТУРА ПРОЕКТА"
echo "-----------------------------------"
echo "Корень проекта:"
ls -la | grep -E "^d" | awk '{print $9}'
echo ""
if [ -d "frontend/src" ]; then
    echo "frontend/src:"
    ls frontend/src
    echo ""
    echo "frontend/src/components:"
    ls frontend/src/components 2>/dev/null || echo "Папка components не найдена"
fi
echo ""
echo ""

echo "===================================="
echo "✅ ДИАГНОСТИКА ЗАВЕРШЕНА"
echo ""
echo "📤 СКОПИРУЙ ВЕСЬ ВЫВОД ВЫШЕ И ОТПРАВЬ МНЕ"
echo "===================================="
