import random

from .prompts_data import (
    TOPIC_KEYWORDS,
    THEME_IMAGES,
    DIFFICULTY_DESCRIPTIONS,
    SUCCESS_REPLIES,
    FAIL_REPLIES,
    RARE_SUCCESS,
    RARE_FAILS,
    TOPIC_SPECIFIC_PHRASES,
    QUESTION_TYPE_DEFINITIONS,
    TOPIC_TYPE_PRIORITIES
)

def detect_topic_category(topic_str):
    """
    Определяет категорию темы по ключевым словам
    """
    topic_lower = topic_str.lower()

    for category, keywords in TOPIC_KEYWORDS.items():
        if any(word in topic_lower for word in keywords):
            return category

    return 'default'


def build_prompt(topic, count, difficulty_curve, player_count=1, question_configs=None):
    """
    Строит промпт для LLM с учётом темы, сложности и количества игроков

    Args:
        topic: тема квиза
        count: количество вопросов
        difficulty_curve: список сложностей для каждого вопроса
        player_count: количество игроков (для контекста)
        question_configs: список настроек для каждого вопроса [{'difficulty':..., 'type':..., 'refinement':...}]

    Returns:
        str: готовый промпт для OpenAI
    """
    # Определяем категорию темы
    theme_category = detect_topic_category(topic)

    # Добавляем инструкции по картинкам
    if theme_category in THEME_IMAGES:
        available_images = THEME_IMAGES[theme_category]
        image_list = ', '.join([
            f'"/static/images/themes/{theme_category}/{img}.jpg"'
            for img in available_images
        ])

        image_instruction = f"""
ДОСТУПНЫЕ ИЗОБРАЖЕНИЯ: {image_list}

Для каждого вопроса выбери СЛУЧАЙНОЕ подходящее изображение из списка.
Добавь поле "image_url" с одним из этих путей.
Не используй одну картинку дважды подряд.
Если изображение не подходит по смыслу — оставь поле пустым.
"""
    else:
        image_instruction = "Изображения для этой темы недоступны. Оставь поле image_url пустым для всех вопросов."

    # Инструкции по типам вопросов (Автоматический выбор или Ручной)
    type_selection_instruction = ""
    
    if not question_configs:
        # АВТОМАТИЧЕСКИЙ РЕЖИМ
        priorities = TOPIC_TYPE_PRIORITIES.get(theme_category, TOPIC_TYPE_PRIORITIES['default'])
        priorities_str = ", ".join(priorities)
        
        type_defs = "\n".join([f"- {k}: {v}" for k, v in QUESTION_TYPE_DEFINITIONS.items()])
        
        type_selection_instruction = f"""
ВЫБОР ТИПА ВОПРОСА (АВТОМАТИЧЕСКИЙ РЕЖИМ):
Для каждого вопроса САМ выбери наиболее подходящий тип, исходя из темы и сложности.

Доступные типы и правила:
{type_defs}

Приоритетные типы для этой темы: {priorities_str}

ПРАВИЛА РАСПРЕДЕЛЕНИЯ:
1. Используй РАЗНООБРАЗИЕ — не более 2 одинаковых типов подряд.
2. Минимум 3-4 разных типа на каждые 10 вопросов.
3. Учитывай сложность:
   - easy: text_standard, text_fill_blank
   - medium: text_definition, text_quote
   - hard: text_odd_one, text_numeric
   - very_hard: text_fun_logic, text_definition
   - fun: text_fun_logic
"""

    # Строим список требований для каждого вопроса
    requirements_list = []
    for i in range(count):
        num = i + 1
        if question_configs and i < len(question_configs):
            # Индивидуальные настройки
            config = question_configs[i]
            diff = config.get('difficulty', 'medium')
            q_type = config.get('type', 'text')
            refinement = config.get('refinement', '')
            
            desc = DIFFICULTY_DESCRIPTIONS.get(diff, DIFFICULTY_DESCRIPTIONS['medium'])
            req = f"Вопрос {num}: Сложность {diff} ({desc})."
            
            if q_type != 'text':
                req += f" ТИП: {q_type}."
            if refinement:
                req += f" КОНКРЕТНАЯ ТЕМА: {refinement}."
            requirements_list.append(req)
        else:
            # Стандартная кривая
            diff = difficulty_curve[i] if i < len(difficulty_curve) else 'medium'
            requirements_list.append(f"Вопрос {num}: {DIFFICULTY_DESCRIPTIONS.get(diff, diff)}")

    difficulty_requirements = "\n".join(requirements_list)

    # Контекст по количеству игроков
    player_context = ""
    if player_count >= 8:
        player_context = "\nИгра для большой компании (8+ человек), делай вопросы интересными и разнообразными."
    elif player_count <= 3:
        player_context = "\nИгра для маленькой группы (2-3 человека), вопросы должны быть не слишком сложными."

    prompt = f"""Ты — профессиональный составитель викторин для домашних игр.

ТЕМА: "{topic}"
КОЛИЧЕСТВО ВОПРОСОВ: {count}
{player_context}

{image_instruction}
{type_selection_instruction}

ТРЕБОВАНИЯ К ВОПРОСАМ (следуй им строго для каждого номера):
{difficulty_requirements}

ФОРМАТ ВЫВОДА — строго JSON:
{{
  "questions": [
    {{
      "text": "Текст вопроса (максимум 200 символов)",
      "choices": ["Вариант А (макс 40 символов)", "Вариант Б", "Вариант В", "Вариант Г"],
      "correct_index": 0,
      "difficulty": "medium",
      "type": "text_standard",
      "explanation": "Краткое объяснение правильного ответа (до 300 символов)",
      "image_url": "/static/images/themes/category/image.jpg"
    }}
  ]
}}

СТРОГИЕ ПРАВИЛА:
1. Ровно 4 варианта ответа для каждого вопроса
2. Текст вопроса: до 200 символов
3. Варианты ответа: до 40 символов каждый
4. correct_index: число от 0 до 3 (индекс правильного ответа в массиве choices)
5. Все неправильные ответы должны быть ПРАВДОПОДОБНЫМИ (не очевидно неправильными)
6. Варианты ответа должны быть УНИКАЛЬНЫМИ
7. explanation: краткое (до 300 символов) объяснение с интересным фактом
8. difficulty: одно из значений "easy", "medium", "hard", "very_hard", "fun"
9. Не используй вопросы с точными датами (только если тема не "История")
10. Для сложности "fun" создавай лёгкие шуточные вопросы для разрядки
11. Поле "type" обязательно заполняй одним из доступных типов (например, "text_standard", "text_quote" и т.д.)
11. Если указан ТИП или КОНКРЕТНАЯ ТЕМА, обязательно учти это.

ПРИМЕРЫ ХОРОШИХ ВОПРОСОВ:

Лёгкий (easy):
{{
  "text": "Какого цвета листья у большинства деревьев летом?",
  "choices": ["Зелёного", "Красного", "Жёлтого", "Синего"],
  "correct_index": 0,
  "difficulty": "easy",
  "type": "text_standard",
  "explanation": "Летом листья зелёные благодаря хлорофиллу, который участвует в фотосинтезе",
  "image_url": ""
}}

Средний (medium):
{{
  "text": "Кто написал роман 'Война и мир'?",
  "choices": ["Лев Толстой", "Фёдор Достоевский", "Антон Чехов", "Иван Тургенев"],
  "correct_index": 0,
  "difficulty": "medium",
  "type": "text_standard",
  "explanation": "Лев Толстой написал 'Войну и мир' в 1865-1869 годах, это один из самых известных романов в мировой литературе",
  "image_url": ""
}}

Сложный (hard):
{{
  "text": "Какой актёр сыграл главную роль в фильме 'Берегись автомобиля'?",
  "choices": ["Иннокентий Смоктуновский", "Олег Ефремов", "Евгений Леонов", "Юрий Никулин"],
  "correct_index": 0,
  "difficulty": "hard",
  "type": "image_contextual",
  "explanation": "Иннокентий Смоктуновский блестяще сыграл страхового агента Деточкина в этой комедии 1966 года",
  "image_url": "/static/images/themes/films/soviet_cinema.jpg"
}}

Шуточный (fun):
{{
  "text": "Сколько континентов на Земле, если не считать тех, о которых все забыли?",
  "choices": ["7", "5", "6", "42"],
  "correct_index": 0,
  "difficulty": "fun",
  "type": "text_fun_logic",
  "explanation": "На Земле 7 континентов, и мы все их помним! (хотя Атлантиду некоторые забывают)",
  "image_url": ""
}}

Создай {count} вопросов строго по указанной теме '{topic}' и сложности.
Верни ТОЛЬКО валидный JSON, без дополнительного текста или markdown.
"""

    return prompt


def get_type_instructions(question_type):
    """Возвращает инструкции для конкретного типа вопроса"""
    instructions = {
        'text': """
Создай текстовый вопрос с 4 вариантами ответа.
Все варианты должны быть правдоподобными.
""",
        'image': """
Создай вопрос, который требует визуального восприятия.
Например: "Кто изображён на этой фотографии?" или "Что происходит на кадре?"
Укажи подходящий image_url из доступных (выбери из списка выше или оставь пустым).
""",
        'audio': """
Создай вопрос про музыку, звуки или цитаты.
Например: "Какая группа исполняет эту песню?" или "Из какого фильма эта фраза?"
""",
        'video': """
Создай вопрос про видео, фильм или клип.
Например: "Из какого фильма этот кадр?" или "Что произойдет дальше?"
"""
    }
    return instructions.get(question_type, instructions['text'])


def build_prompt_for_single_question(topic, difficulty, question_type='text', topic_refinement=''):
    """
    Генерирует промпт для ОДНОГО вопроса с детальными настройками
    """
    final_topic = topic
    if topic_refinement:
        final_topic = f"{topic} (конкретно: {topic_refinement})"

    type_instructions = get_type_instructions(question_type)
    difficulty_desc = DIFFICULTY_DESCRIPTIONS.get(difficulty, DIFFICULTY_DESCRIPTIONS['medium'])

    prompt = f"""Создай ОДИН вопрос для викторины.

ТЕМА: {final_topic}
СЛОЖНОСТЬ: {difficulty_desc} ({difficulty})
ТИП ВОПРОСА: {question_type}

{type_instructions}

ФОРМАТ ВЫВОДА — строго JSON:
{{
  "text": "Текст вопроса (до 200 символов)",
  "choices": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
  "correct_index": 0,
  "difficulty": "{difficulty}",
  "explanation": "Объяснение (до 300 символов)",
  "image_url": ""
}}

Верни ТОЛЬКО валидный JSON."""
    return prompt


def get_reply(is_correct, difficulty, topic=None):
    """
    Возвращает мотивирующую фразу для ответа

    Args:
        is_correct: правильный ли ответ
        difficulty: сложность вопроса
        topic: тема квиза (опционально)

    Returns:
        str: фраза для отображения игроку
    """
    # 1% шанс на редкую фразу
    if random.random() < 0.01:
        if is_correct:
            return random.choice(RARE_SUCCESS)
        else:
            return random.choice(RARE_FAILS)

    # Пытаемся найти тематические фразы
    if topic:
        topic_category = detect_topic_category(topic)
        if topic_category in TOPIC_SPECIFIC_PHRASES:
            phrases = TOPIC_SPECIFIC_PHRASES[topic_category]
            phrase_type = 'success' if is_correct else 'fail'
            return random.choice(phrases[phrase_type])

    # Обычные фразы по сложности
    if is_correct:
        return random.choice(SUCCESS_REPLIES.get(difficulty, SUCCESS_REPLIES['medium']))
    else:
        return random.choice(FAIL_REPLIES.get(difficulty, FAIL_REPLIES['medium']))


# ============================================================================
# КРИВАЯ СЛОЖНОСТИ
# ============================================================================

def get_difficulty_curve(total_questions, player_count=1):
    """
    Генерирует кривую сложности вопросов

    Логика:
    - Начинаем с лёгкого (разминка)
    - Постепенное нарастание сложности
    - Пик напряжения перед концом (very_hard)
    - Финал: сложный → fun → средний (разрядка → завершение)
    - Адаптация под количество игроков

    Args:
        total_questions: общее количество вопросов
        player_count: количество игроков

    Returns:
        list: список сложностей ['easy', 'medium', 'hard', ...]
    """
    if total_questions <= 5:
        # Короткий квиз
        base_curve = ["easy", "medium", "hard", "hard", "fun"]
    else:
        # Длинный квиз
        base_curve = ["easy"]  # разминка
        middle = total_questions - 4

        for i in range(middle):
            progress = i / middle
            if progress < 0.3:
                base_curve.append("medium")
            elif progress < 0.7:
                base_curve.append("hard")
            else:
                base_curve.append("very_hard")  # пик напряжения

        # Финал: пик → разрядка → завершение
        base_curve.extend(["very_hard", "fun", "medium"])

    # Адаптация под количество игроков
    adjusted = adjust_for_players(base_curve, player_count)

    return adjusted[:total_questions]  # обрезаем до нужной длины


def adjust_for_players(curve, player_count):
    """
    Адаптирует сложность под количество игроков

    Логика:
    - Мало игроков (1-3): снижаем сложность (hard → medium)
    - Средняя группа (4-7): стандартная кривая
    - Много игроков (8+): добавляем вызов (extra very_hard)

    Args:
        curve: базовая кривая сложности
        player_count: количество игроков

    Returns:
        list: скорректированная кривая
    """
    adjusted = curve.copy()

    if player_count >= 8:
        # Много игроков → добавляем вызов
        insert_pos = len(adjusted) // 2
        adjusted.insert(insert_pos, "very_hard")

    elif player_count <= 3:
        # Мало игроков → смягчаем
        adjusted = [
            "medium" if diff == "hard" else
            "hard" if diff == "very_hard" else
            diff
            for diff in adjusted
        ]

    elif player_count >= 5:
        # Средняя группа → один дополнительный hard в середине
        insert_pos = len(adjusted) // 3
        adjusted.insert(insert_pos, "hard")

    return adjusted