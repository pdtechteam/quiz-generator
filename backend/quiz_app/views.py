# ============================================================================
# ФАЙЛ 2: backend/quiz_app/views.py (ЗАМЕНИ ВЕСЬ ФАЙЛ)
# ============================================================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Quiz, Question, Choice, GameSession, Player, Answer
from .serializers import (
    QuizListSerializer, QuizDetailSerializer, QuizCreateSerializer,
    QuestionSerializer, QuestionForPlayerSerializer,
    GameSessionSerializer, SessionCreateSerializer,
    PlayerSerializer, AnswerSerializer, AnswerSubmitSerializer,
    LeaderboardSerializer
)


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления квизами

    Endpoints:
    - GET /api/quizzes/ - список всех квизов
    - POST /api/quizzes/ - создать новый квиз
    - GET /api/quizzes/{id}/ - детали квиза
    - PUT /api/quizzes/{id}/ - обновить квиз
    - DELETE /api/quizzes/{id}/ - удалить квиз
    """
    queryset = Quiz.objects.all().order_by('-created_at')
    permission_classes = [AllowAny]  # Для домашнего использования

    def get_serializer_class(self):
        """Выбираем сериализатор в зависимости от действия"""
        if self.action == 'list':
            return QuizListSerializer
        elif self.action == 'create':
            return QuizCreateSerializer
        return QuizDetailSerializer

    def create(self, request, *args, **kwargs):
        """
        Создание квиза
        Вопросы будут добавлены через LLM генерацию (Этап 4)
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = serializer.save()

        # Возвращаем детальную информацию
        detail_serializer = QuizDetailSerializer(quiz)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """
        GET /api/quizzes/{id}/questions/
        Получить все вопросы квиза (для админа)
        """
        quiz = self.get_object()
        questions = quiz.questions.all().order_by('order')
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        GET /api/quizzes/{id}/preview/
        Предпросмотр квиза (тема, описание, картинка - БЕЗ вопросов)
        """
        quiz = self.get_object()
        data = {
            'id': quiz.id,
            'title': quiz.title,
            'topic': quiz.topic,
            'description': quiz.description,
            'image_url': quiz.image_url or quiz.get_theme_image(),
            'question_count': quiz.question_count,
            'time_per_question': quiz.time_per_question,
        }
        return Response(data)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        '''
        POST /api/quizzes/generate/
        Генерация квиза с вопросами через LLM

        Body:
        {
            "topic": "Советские фильмы",
            "count": 10,
            "description": "Квиз о классике советского кино",
            "time_per_question": 20,
            "player_count": 4
        }
        '''
        from .generation import generate_and_save_quiz

        topic = request.data.get('topic')
        count = request.data.get('count', 10)
        description = request.data.get('description', '')
        time_per_question = request.data.get('time_per_question', 20)
        player_count = request.data.get('player_count', 1)

        if not topic:
            return Response(
                {'detail': 'Требуется topic'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Генерируем квиз
            quiz = generate_and_save_quiz(
                topic=topic,
                count=count,
                description=description,
                time_per_question=time_per_question,
                player_count=player_count
            )

            # Возвращаем созданный квиз
            serializer = QuizDetailSerializer(quiz)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'detail': f'Ошибка генерации: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GameSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления игровыми сессиями

    Endpoints:
    - GET /api/sessions/ - список всех сессий
    - POST /api/sessions/ - создать новую сессию
    - GET /api/sessions/{code}/ - информация о сессии по коду
    """
    queryset = GameSession.objects.all()
    permission_classes = [AllowAny]
    lookup_field = 'code'  # Используем код вместо ID

    def get_serializer_class(self):
        if self.action == 'create':
            return SessionCreateSerializer
        return GameSessionSerializer

    def create(self, request, *args, **kwargs):
        """Создание игровой сессии"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()

        # Возвращаем полную информацию о сессии
        detail_serializer = GameSessionSerializer(session)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def state(self, request, code=None):
        """
        GET /api/sessions/{code}/state/
        Получить текущее состояние сессии
        """
        session = self.get_object()
        serializer = GameSessionSerializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def current_question(self, request, code=None):
        """
        GET /api/sessions/{code}/current_question/
        Получить текущий вопрос (для игроков, БЕЗ правильного ответа)
        """
        session = self.get_object()

        if session.state not in ['running', 'paused']:
            return Response(
                {'detail': 'Игра не запущена'},
                status=status.HTTP_400_BAD_REQUEST
            )

        question = session.get_current_question()
        if not question:
            return Response(
                {'detail': 'Вопросов больше нет'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = QuestionForPlayerSerializer(question)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, code=None):
        """
        GET /api/sessions/{code}/leaderboard/
        Получить таблицу лидеров
        """
        session = self.get_object()
        players = session.players.all().order_by('-score', 'joined_at')

        leaderboard_data = [
            {
                'position': idx + 1,
                'player_id': player.id,
                'name': player.name,
                'score': player.score,
                'current_streak': player.current_streak,
                'connected': player.connected,
                'is_host': player.is_host,
            }
            for idx, player in enumerate(players)
        ]

        serializer = LeaderboardSerializer(leaderboard_data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def disconnected_players(self, request, code=None):
        """
        GET /api/sessions/{code}/disconnected_players/
        Получить список отключенных игроков (для переподключения)
        """
        session = self.get_object()
        disconnected = session.players.filter(connected=False)
        serializer = PlayerSerializer(disconnected, many=True)
        return Response(serializer.data)


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления игроками

    Endpoints:
    - GET /api/players/ - список всех игроков
    - POST /api/players/ - создать игрока (присоединиться к игре)
    - GET /api/players/{id}/ - информация об игроке
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Создание игрока (присоединение к сессии)

        Ожидает:
        {
            "session_code": "1234",
            "name": "Иван"
        }
        """
        session_code = request.data.get('session_code')
        name = request.data.get('name')

        if not session_code or not name:
            return Response(
                {'detail': 'Требуются session_code и name'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Находим сессию
        try:
            session = GameSession.objects.get(code=session_code)
        except GameSession.DoesNotExist:
            return Response(
                {'detail': 'Сессия не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверяем, нет ли уже игрока с таким именем
        existing_player = session.players.filter(name=name).first()
        if existing_player:
            # Переподключение
            existing_player.connected = True
            existing_player.update_last_seen()
            existing_player.save()

            serializer = self.get_serializer(existing_player)
            return Response(serializer.data)

        # Создаём нового игрока
        player = Player.objects.create(
            session=session,
            name=name,
            connected=True
        )
        player.update_last_seen()

        serializer = self.get_serializer(player)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def become_host(self, request, pk=None):
        """
        POST /api/players/{id}/become_host/
        Стать ведущим
        """
        player = self.get_object()
        session = player.session

        # Проверяем, нет ли уже ведущего
        if session.host:
            return Response(
                {'detail': 'Ведущий уже выбран'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Назначаем ведущим
        player.is_host = True
        player.save()

        session.host = player
        session.save()

        serializer = self.get_serializer(player)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def heartbeat(self, request, pk=None):
        """
        POST /api/players/{id}/heartbeat/
        Обновление last_seen (heartbeat)
        """
        player = self.get_object()
        player.update_last_seen()

        return Response({'status': 'ok'})


class AnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet для ответов игроков

    Основная работа будет через WebSocket (Этап 3),
    но REST API может быть полезен для статистики
    """
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def by_session(self, request):
        """
        GET /api/answers/by_session/?session_code=1234
        Получить все ответы по сессии
        """
        session_code = request.query_params.get('session_code')
        if not session_code:
            return Response(
                {'detail': 'Требуется session_code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = Answer.objects.filter(
            player__session__code=session_code
        ).select_related('player', 'question', 'choice')

        serializer = self.get_serializer(answers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_player(self, request):
        """
        GET /api/answers/by_player/?player_id=7
        Получить все ответы игрока
        """
        player_id = request.query_params.get('player_id')
        if not player_id:
            return Response(
                {'detail': 'Требуется player_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = Answer.objects.filter(
            player_id=player_id
        ).select_related('question', 'choice')

        serializer = self.get_serializer(answers, many=True)
        return Response(serializer.data)