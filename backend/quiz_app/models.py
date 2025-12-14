# quiz_app/models.py

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import random
import string
import uuid


class Quiz(models.Model):
    """
    Набор вопросов по определённой теме.
    Создаётся администратором через TV интерфейс.
    """
    title = models.CharField(
        max_length=200,
        verbose_name="Название квиза"
    )
    topic = models.CharField(
        max_length=200,
        verbose_name="Тема",
        help_text="Например: Советские фильмы, География России"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Описание",
        help_text="Автогенерируется LLM или заполняется вручную"
    )
    image_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="URL картинки темы"
    )
    question_count = models.IntegerField(
        default=0,
        verbose_name="Количество вопросов"
    )
    time_per_question = models.IntegerField(
        default=20,
        validators=[MinValueValidator(10), MaxValueValidator(60)],
        verbose_name="Время на вопрос (сек)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )

    class Meta:
        verbose_name = "Квиз"
        verbose_name_plural = "Квизы"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.question_count} вопросов)"

    def get_theme_image(self):
        """Возвращает путь к картинке темы"""
        if self.image_url:
            return self.image_url

        # Определяем категорию по ключевым словам
        topic_lower = self.topic.lower()

        if any(word in topic_lower for word in ['фильм', 'кино', 'актёр', 'режиссёр']):
            return '/static/images/themes/films/default.jpg'
        elif any(word in topic_lower for word in ['животн', 'зоо', 'фауна']):
            return '/static/images/themes/animals/default.jpg'
        elif any(word in topic_lower for word in ['геогра', 'стран', 'город', 'столиц']):
            return '/static/images/themes/geography/default.jpg'
        elif any(word in topic_lower for word in ['музык', 'песн', 'группа', 'исполнитель']):
            return '/static/images/themes/music/default.jpg'
        elif any(word in topic_lower for word in ['истор', 'войн', 'век', 'эпох']):
            return '/static/images/themes/history/default.jpg'

        return '/static/images/themes/default.jpg'


class Question(models.Model):
    """
    Отдельный вопрос квиза.
    Генерируется LLM или создаётся вручную.
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Лёгкий'),
        ('medium', 'Средний'),
        ('hard', 'Сложный'),
        ('very_hard', 'Очень сложный'),
        ('fun', 'Шуточный'),
    ]

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name="Квиз"
    )
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="UUID"
    )
    order = models.IntegerField(
        verbose_name="Порядковый номер",
        help_text="Порядок вопроса в квизе"
    )
    text = models.TextField(
        max_length=200,
        verbose_name="Текст вопроса"
    )
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='medium',
        verbose_name="Сложность"
    )
    explanation = models.TextField(
        blank=True,
        max_length=300,
        verbose_name="Объяснение",
        help_text="Показывается после ответа"
    )
    image_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="URL картинки"
    )
    # ===== ДОБАВЬ ЭТО ПОЛЕ =====
    time_limit = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        verbose_name="Время на вопрос (сек)",
        help_text="0 = использовать время из квиза. Можно задать индивидуальное время для сложных вопросов"
    )
    # ===========================
    generated_by_model = models.BooleanField(
        default=True,
        verbose_name="Сгенерирован LLM"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
        ordering = ['order']
        unique_together = ['quiz', 'order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}..."

    def get_correct_choice(self):
        """Возвращает правильный вариант ответа"""
        return self.choices.filter(is_correct=True).first()

    # ===== ДОБАВЬ ЭТОТ МЕТОД =====
    def get_time_limit(self):
        """Возвращает время на вопрос (своё или из квиза)"""
        if self.time_limit > 0:
            return self.time_limit
        return self.quiz.time_per_question


class Choice(models.Model):
    """
    Вариант ответа на вопрос.
    Всегда 4 варианта, один правильный.
    """
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='choices',
        verbose_name="Вопрос"
    )
    text = models.CharField(
        max_length=200,
        verbose_name="Текст варианта"
    )
    is_correct = models.BooleanField(
        default=False,
        verbose_name="Правильный ответ"
    )
    order = models.IntegerField(
        default=0,
        verbose_name="Порядковый номер"
    )

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответов"
        ordering = ['order']

    def __str__(self):
        mark = "✓" if self.is_correct else "✗"
        return f"{mark} {self.text[:30]}"


def generate_session_code():
    """Генерирует уникальный 4-значный код сессии"""
    return ''.join(random.choices(string.digits, k=4))


class GameSession(models.Model):
    """
    Активная игровая сессия.
    Одна сессия = одно прохождение квиза.
    """
    STATE_CHOICES = [
        ('waiting', 'Ожидание игроков'),
        ('running', 'Игра идёт'),
        ('paused', 'На паузе'),
        ('finished', 'Завершена'),
    ]

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name="Квиз"
    )
    code = models.CharField(
        max_length=4,
        unique=True,
        default=generate_session_code,
        verbose_name="Код сессии",
        help_text="4 цифры для подключения"
    )
    state = models.CharField(
        max_length=20,
        choices=STATE_CHOICES,
        default='waiting',
        verbose_name="Состояние"
    )
    current_question = models.IntegerField(
        default=0,
        verbose_name="Текущий вопрос",
        help_text="Индекс текущего вопроса (начиная с 0)"
    )
    host = models.ForeignKey(
        'Player',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hosted_sessions',
        verbose_name="Ведущий"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания"
    )
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Время начала игры"
    )
    finished_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Время окончания"
    )

    class Meta:
        verbose_name = "Игровая сессия"
        verbose_name_plural = "Игровые сессии"
        ordering = ['-created_at']

    def __str__(self):
        return f"Сессия {self.code} - {self.quiz.title} ({self.state})"

    def get_current_question(self):
        """Возвращает текущий вопрос"""
        questions = self.quiz.questions.all().order_by('order')

        print(f"🔍 Getting question at index {self.current_question}")
        print(f"📊 Total questions: {questions.count()}")

        if 0 <= self.current_question < questions.count():
            q = questions[self.current_question]
            print(f"✅ Found question: {q.text[:50]}")
            return q

        print(f"❌ No question found at index {self.current_question}")
        return None

    def get_connected_players_count(self):
        """Возвращает количество подключённых игроков"""
        return self.players.filter(connected=True).count()

    def get_total_questions(self):
        """Возвращает общее количество вопросов в квизе"""
        return self.quiz.questions.all().count()

    def is_last_question(self):
        """Проверяет, последний ли это вопрос"""
        return self.current_question >= self.get_total_questions() - 1


class Player(models.Model):
    """
    Игрок в игровой сессии.
    """
    session = models.ForeignKey(
        GameSession,
        on_delete=models.CASCADE,
        related_name='players',
        verbose_name="Сессия"
    )
    name = models.CharField(
        max_length=50,
        verbose_name="Имя игрока"
    )
    score = models.IntegerField(
        default=0,
        verbose_name="Счёт"
    )
    current_streak = models.IntegerField(
        default=0,
        verbose_name="Текущая серия",
        help_text="Количество правильных ответов подряд"
    )
    max_streak = models.IntegerField(
        default=0,
        verbose_name="Максимальная серия"
    )
    connected = models.BooleanField(
        default=True,
        verbose_name="Подключён"
    )
    last_seen = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Последняя активность",
        help_text="Обновляется при каждом ping"
    )
    is_host = models.BooleanField(
        default=False,
        verbose_name="Является ведущим"
    )
    joined_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Время подключения"
    )

    class Meta:
        verbose_name = "Игрок"
        verbose_name_plural = "Игроки"
        ordering = ['-score']
        unique_together = ['session', 'name']

    def __str__(self):
        host_mark = "👑" if self.is_host else ""
        status = "🔌" if not self.connected else "✓"
        return f"{status} {self.name} {host_mark} - {self.score} очков"

    def update_last_seen(self):
        """Обновляет время последней активности (для heartbeat)"""
        self.last_seen = timezone.now()
        self.save(update_fields=['last_seen'])

    def check_connection(self, timeout_seconds=15):
        """Проверяет, подключён ли игрок (не было ping > 15 сек)"""
        time_since_last_seen = (timezone.now() - self.last_seen).total_seconds()
        should_be_connected = time_since_last_seen <= timeout_seconds

        if self.connected != should_be_connected:
            self.connected = should_be_connected
            self.save(update_fields=['connected'])

        return should_be_connected

    def increment_score(self, points):
        """Увеличивает счёт игрока"""
        self.score += points
        self.save(update_fields=['score'])

    def increment_streak(self):
        """Увеличивает серию правильных ответов"""
        self.current_streak += 1
        if self.current_streak > self.max_streak:
            self.max_streak = self.current_streak
        self.save(update_fields=['current_streak', 'max_streak'])

    def reset_streak(self):
        """Сбрасывает текущую серию"""
        self.current_streak = 0
        self.save(update_fields=['current_streak'])


class Answer(models.Model):
    """
    Ответ игрока на вопрос.
    """
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name="Игрок"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name="Вопрос"
    )
    choice = models.ForeignKey(
        Choice,
        on_delete=models.CASCADE,
        verbose_name="Выбранный вариант"
    )
    time_taken = models.FloatField(
        verbose_name="Время ответа (сек)",
        help_text="Сколько секунд потребовалось для ответа"
    )
    is_correct = models.BooleanField(
        verbose_name="Правильный ответ"
    )
    points_earned = models.IntegerField(
        verbose_name="Заработанные очки"
    )
    answered_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Время ответа"
    )

    class Meta:
        verbose_name = "Ответ"
        verbose_name_plural = "Ответы"
        unique_together = ['player', 'question']
        ordering = ['answered_at']

    def __str__(self):
        mark = "✓" if self.is_correct else "✗"
        return f"{mark} {self.player.name} - Q{self.question.order} ({self.points_earned} pts)"