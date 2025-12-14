# ============================================================================
# ФАЙЛ 1: backend/quiz_app/serializers.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

from rest_framework import serializers
from .models import Quiz, Question, Choice, GameSession, Player, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    """Сериализатор для вариантов ответа"""

    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']
        # is_correct скрываем при отправке игрокам (см. ниже)


class ChoiceForPlayerSerializer(serializers.ModelSerializer):
    """Вариант ответа БЕЗ информации о правильности (для игроков)"""

    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']
        # Не включаем is_correct!


class QuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для вопросов (полный, с правильными ответами)"""
    choices = ChoiceSerializer(many=True, read_only=True)
    correct_choice = serializers.SerializerMethodField()
    time_limit = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'uuid', 'order', 'text', 'difficulty',
            'explanation', 'image_url', 'time_limit',
            'choices', 'correct_choice'
        ]

    def get_correct_choice(self, obj):
        """Возвращает ID правильного варианта"""
        correct = obj.get_correct_choice()
        return correct.id if correct else None

    def get_time_limit(self, obj):
        """Получаем время (своё или из квиза)"""
        return obj.get_time_limit()  # <-- ИЗМЕНЕНО


class QuestionForPlayerSerializer(serializers.ModelSerializer):
    """Вопрос для игрока (БЕЗ правильного ответа и объяснения)"""
    choices = ChoiceForPlayerSerializer(many=True, read_only=True)
    time_limit = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'uuid', 'order', 'text', 'difficulty',
            'image_url', 'time_limit', 'choices'
        ]

    def get_time_limit(self, obj):
        """Получаем время (своё или из квиза)"""
        return obj.get_time_limit()  # <-- ИЗМЕНЕНО


class QuizListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка квизов (краткая информация)"""

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'topic', 'description',
            'image_url', 'question_count', 'time_per_question',
            'created_at'
        ]
        read_only_fields = ['created_at']


class QuizDetailSerializer(serializers.ModelSerializer):
    """Детальная информация о квизе с вопросами"""
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'topic', 'description',
            'image_url', 'question_count', 'time_per_question',
            'created_at', 'questions'
        ]
        read_only_fields = ['created_at', 'question_count']


class QuizCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания квиза (без вопросов)"""

    class Meta:
        model = Quiz
        fields = ['title', 'topic', 'description', 'time_per_question']

    def create(self, validated_data):
        """Создаём квиз, вопросы будут добавлены через LLM генерацию"""
        quiz = Quiz.objects.create(**validated_data)
        return quiz


class PlayerSerializer(serializers.ModelSerializer):
    """Сериализатор для игрока"""
    session_code = serializers.CharField(source='session.code', read_only=True)

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'score', 'current_streak', 'max_streak',
            'connected', 'is_host', 'joined_at', 'session_code'
        ]
        read_only_fields = [
            'score', 'current_streak', 'max_streak',
            'connected', 'is_host', 'joined_at'
        ]


class GameSessionSerializer(serializers.ModelSerializer):
    """Сериализатор для игровой сессии"""
    players = PlayerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    current_question_data = serializers.SerializerMethodField()
    connected_players_count = serializers.IntegerField(
        source='get_connected_players_count',
        read_only=True
    )

    class Meta:
        model = GameSession
        fields = [
            'id', 'code', 'state', 'quiz', 'quiz_title',
            'current_question', 'current_question_data',
            'created_at', 'players', 'connected_players_count'
        ]
        read_only_fields = ['code', 'created_at']

    def get_current_question_data(self, obj):
        """Возвращает текущий вопрос если игра идёт"""
        if obj.state in ['running', 'paused']:
            question = obj.get_current_question()
            if question:
                return QuestionForPlayerSerializer(question).data
        return None


class SessionCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания игровой сессии"""

    class Meta:
        model = GameSession
        fields = ['quiz']

    def create(self, validated_data):
        """Создаём сессию с автогенерированным кодом"""
        session = GameSession.objects.create(**validated_data)
        return session


class AnswerSerializer(serializers.ModelSerializer):
    """Сериализатор для ответа игрока"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    question_text = serializers.CharField(source='question.text', read_only=True)
    choice_text = serializers.CharField(source='choice.text', read_only=True)

    class Meta:
        model = Answer
        fields = [
            'id', 'player', 'player_name', 'question', 'question_text',
            'choice', 'choice_text', 'time_taken', 'is_correct',
            'points_earned', 'answered_at'
        ]
        read_only_fields = ['is_correct', 'points_earned', 'answered_at']


class AnswerSubmitSerializer(serializers.Serializer):
    """Сериализатор для отправки ответа через WebSocket/API"""
    player_id = serializers.IntegerField()
    question_uuid = serializers.UUIDField()
    choice_id = serializers.IntegerField()
    time_taken = serializers.FloatField(min_value=0)

    def validate_time_taken(self, value):
        """Проверяем что время не превышает лимит вопроса"""
        # Дополнительная валидация будет в views
        if value > 120:  # Максимум 2 минуты
            raise serializers.ValidationError("Время ответа слишком большое")
        return value


class LeaderboardSerializer(serializers.Serializer):
    """Сериализатор для таблицы лидеров"""
    position = serializers.IntegerField()
    player_id = serializers.IntegerField()
    name = serializers.CharField()
    score = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    connected = serializers.BooleanField()
    is_host = serializers.BooleanField()