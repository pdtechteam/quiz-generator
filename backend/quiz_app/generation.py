# ============================================================================
# ФАЙЛ 3: backend/quiz_app/generation.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

import json
import time
import random
import hashlib
import logging
from typing import List, Optional

import openai
from openai import OpenAI
from pydantic import BaseModel, Field, validator
from django.core.cache import cache
from django.conf import settings

from .models import Quiz, Question, Choice
from .prompts import build_prompt, get_difficulty_curve

logger = logging.getLogger(__name__)

# Версии для кеша (меняй при изменении промптов или схемы)
PROMPT_VERSION = "2024-v3"
QUESTION_SCHEMA_VERSION = "v1"

# Мапинг сложности на время (в секундах)
DIFFICULTY_TIME_MAP = {
    'easy': 15,       # Лёгкий: 15 сек
    'medium': 20,     # Средний: 20 сек
    'hard': 30,       # Сложный: 30 сек
    'very_hard': 45,  # Очень сложный: 45 сек
    'fun': 10         # Шуточный: 10 сек
}

# ============================================================================
# PYDANTIC СХЕМЫ ДЛЯ ВАЛИДАЦИИ
# ============================================================================

class QuestionSchema(BaseModel):
    """Схема валидации вопроса от LLM"""
    text: str = Field(max_length=200)
    choices: List[str] = Field(min_items=4, max_items=4)
    correct_index: int = Field(ge=0, le=3)
    difficulty: str = Field(default="medium")
    explanation: str = Field(max_length=300, default="")
    image_url: str = Field(max_length=500, default="")

    @validator('choices')
    def validate_choice_length(cls, v):
        """Проверка длины вариантов ответа"""
        if any(len(choice) > 40 for choice in v):
            raise ValueError('Вариант ответа слишком длинный (макс 40 символов)')
        if len(set(v)) != 4:
            raise ValueError('Варианты ответа должны быть уникальными')
        return v

    @validator('text')
    def validate_text(cls, v):
        """Проверка текста вопроса"""
        if len(v) < 10:
            raise ValueError('Текст вопроса слишком короткий (мин 10 символов)')
        return v

    @validator('difficulty')
    def validate_difficulty(cls, v):
        """Проверка сложности"""
        allowed = ['easy', 'medium', 'hard', 'very_hard', 'fun']
        if v not in allowed:
            raise ValueError(f'Сложность должна быть одной из: {allowed}')
        return v


# ============================================================================
# ГЕНЕРАЦИЯ ВОПРОСОВ
# ============================================================================

def generate_cache_key(topic, count, difficulty_curve):
    """
    Генерирует ключ кеша с версиями

    Args:
        topic: тема квиза
        count: количество вопросов
        difficulty_curve: кривая сложности

    Returns:
        str: ключ для кеша
    """
    normalized = topic.lower().strip()
    curve_str = "-".join(difficulty_curve[:count])
    key_str = f"{normalized}:{count}:{curve_str}"
    hash_part = hashlib.md5(key_str.encode()).hexdigest()[:12]

    return f"quiz:{PROMPT_VERSION}:{QUESTION_SCHEMA_VERSION}:{hash_part}"


def generate_questions(topic, count, difficulty='medium', player_count=1, retries=3):
    """
    Генерирует вопросы через OpenAI API с retry логикой

    Args:
        topic: тема квиза
        count: количество вопросов
        difficulty: базовая сложность (используется для кривой)
        player_count: количество игроков (для адаптации сложности)
        retries: количество попыток при ошибке

    Returns:
        list[QuestionSchema]: список сгенерированных вопросов

    Raises:
        ValueError: если генерация не удалась после всех попыток
    """
    # Получаем кривую сложности
    difficulty_curve = get_difficulty_curve(count, player_count)

    # Строим промпт
    prompt = build_prompt(topic, count, difficulty_curve, player_count)

    # Получаем настройки из settings
    api_key = getattr(settings, 'OPENAI_API_KEY', None)
    if not api_key:
        raise ValueError("OPENAI_API_KEY не найден в настройках")

    api_base = getattr(settings, 'OPENAI_API_BASE', None)
    model = getattr(settings, 'OPENAI_MODEL', 'openai/gpt-5.2-chat')

    # ✅ НОВЫЙ API: создаём клиент
    client = OpenAI(
        api_key=api_key,
        base_url=api_base  # Для локальной LLM
    )

    for attempt in range(retries):
        try:
            # ✅ НОВЫЙ API: вызов через client
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system",
                     "content": "You are a helpful assistant that generates quiz questions in JSON format. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                # response_format={"type": "json_object"},  # Закомментировано для MLC
                temperature=0.7,
                max_tokens=3000,
                timeout=60
            )

            # ✅ НОВЫЙ API: получение ответа
            content = response.choices[0].message.content

            # Очистка от markdown (на случай если модель добавит ```)
            content = content.strip()
            if content.startswith('```json'):
                content = content.replace('```json', '', 1)
            if content.startswith('```'):
                content = content.replace('```', '', 1)
            if content.endswith('```'):
                content = content.rsplit('```', 1)[0]
            content = content.strip()

            # Парсим JSON
            data = json.loads(content)

            # Валидация через Pydantic
            questions = [QuestionSchema(**q) for q in data.get('questions', [])]

            if len(questions) != count:
                raise ValueError(f"Ожидалось {count} вопросов, получено {len(questions)}")

            logger.info(f"Successfully generated {count} questions for '{topic}'")
            return questions

        except Exception as e:
            logger.error(f"Attempt {attempt + 1}/{retries} failed: {type(e).__name__}: {e}")

            if attempt == retries - 1:
                raise ValueError(f"Не удалось сгенерировать вопросы после {retries} попыток: {str(e)}")

            # Exponential backoff + jitter
            wait_time = (2 ** attempt) + random.uniform(0, 1)
            logger.warning(f"Waiting {wait_time:.2f}s before retry...")
            time.sleep(wait_time)

    raise ValueError("Исчерпаны все попытки генерации")


def cached_generate(topic, count, difficulty='medium', player_count=1):
    """
    Генерация с кешированием

    Args:
        topic: тема квиза
        count: количество вопросов
        difficulty: базовая сложность
        player_count: количество игроков

    Returns:
        list[QuestionSchema]: список вопросов (из кеша или свежие)
    """
    difficulty_curve = get_difficulty_curve(count, player_count)
    cache_key = generate_cache_key(topic, count, difficulty_curve)

    # Проверяем кеш
    cached = cache.get(cache_key)
    if cached:
        logger.info(f"Cache hit for topic='{topic}', count={count}")
        return [QuestionSchema(**q) for q in cached]

    # Генерируем
    logger.info(f"Generating questions for topic='{topic}', count={count}")
    result = generate_questions(topic, count, difficulty, player_count)

    # Кешируем на 7 дней
    cache.set(cache_key, [q.dict() for q in result], timeout=60 * 60 * 24 * 7)

    return result


def save_questions_to_quiz(quiz, questions):
    """
    Сохраняет сгенерированные вопросы в БД

    Args:
        quiz: экземпляр Quiz
        questions: список QuestionSchema

    Returns:
        int: количество созданных вопросов
    """
    created_count = 0

    for idx, q in enumerate(questions):
        # ✅ ДОБАВЛЕНО: Вычисляем время по сложности
        question_time = DIFFICULTY_TIME_MAP.get(q.difficulty, 0)

        # Создаём вопрос
        question = Question.objects.create(
            quiz=quiz,
            order=idx + 1,
            text=q.text,
            difficulty=q.difficulty,
            explanation=q.explanation,
            image_url=q.image_url or '',
            time_limit=question_time,  # ✅ ИЗМЕНЕНО: используем время по сложности
            generated_by_model=True
        )

        # Создаём варианты ответа
        for choice_idx, choice_text in enumerate(q.choices):
            Choice.objects.create(
                question=question,
                text=choice_text,
                is_correct=(choice_idx == q.correct_index),
                order=choice_idx
            )

        created_count += 1

    # Обновляем счётчик вопросов в квизе
    quiz.question_count = created_count
    quiz.save()

    logger.info(f"Saved {created_count} questions to quiz {quiz.id}")
    return created_count


def generate_and_save_quiz(topic, count, description='', time_per_question=20, player_count=1):
    """
    Полный процесс: создать квиз → сгенерировать вопросы → сохранить

    Args:
        topic: тема квиза
        count: количество вопросов
        description: описание квиза
        time_per_question: время на вопрос
        player_count: количество игроков

    Returns:
        Quiz: созданный квиз с вопросами
    """
    # Создаём квиз
    quiz = Quiz.objects.create(
        title=f"Квиз: {topic}",
        topic=topic,
        description=description,
        time_per_question=time_per_question
    )

    try:
        # Генерируем вопросы
        questions = cached_generate(topic, count, player_count=player_count)

        # Сохраняем в БД
        save_questions_to_quiz(quiz, questions)

        return quiz

    except Exception as e:
        # Если что-то пошло не так — удаляем квиз
        quiz.delete()
        raise e