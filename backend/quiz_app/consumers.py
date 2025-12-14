# ============================================================================
# ФАЙЛ 1: backend/quiz_app/consumers.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import timedelta

from .models import GameSession, Player, Question, Answer, Choice
from .serializers import (
    GameSessionSerializer, PlayerSerializer,
    QuestionForPlayerSerializer, LeaderboardSerializer
)

from .awards import calculate_awards

class GameConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer для игровой логики

    URL: ws://localhost:8000/ws/game/{session_code}/

    События от клиента:
    - join: присоединиться к игре
    - become_host: стать ведущим
    - start_game: запустить игру (только ведущий)
    - answer: отправить ответ
    - pause_game: поставить на паузу (только ведущий)
    - resume_game: продолжить игру (только ведущий)
    - skip_question: пропустить вопрос (только ведущий)
    - end_game: завершить игру досрочно (только ведущий)
    - next_question: следующий вопрос (только ведущий, если автопилот выкл)
    - ping: heartbeat
    - reaction: эмодзи реакция

    События к клиентам:
    - session_state: состояние сессии
    - player_joined: новый игрок
    - player_disconnected: игрок отключился
    - host_assigned: назначен ведущий
    - game_started: игра началась
    - question: новый вопрос
    - answer_received: подтверждение ответа
    - question_result: результаты вопроса
    - game_paused: игра на паузе
    - game_resumed: игра продолжена
    - game_over: игра завершена
    - player_reaction: эмодзи реакция
    - error: ошибка
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_code = None
        self.room_group_name = None
        self.player_id = None
        self.reaction_timestamps = {}  # Rate limiting для реакций

    async def connect(self):
        """Подключение к WebSocket"""
        self.session_code = self.scope['url_route']['kwargs']['code']
        self.room_group_name = f'game_{self.session_code}'

        # Проверяем что сессия существует
        session_exists = await self.check_session_exists()
        if not session_exists:
            await self.close(code=4004)
            return

        # Присоединяемся к группе
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Отправляем текущее состояние сессии
        await self.send_session_state()

    async def disconnect(self, close_code):
        """Отключение от WebSocket"""
        # Помечаем игрока как отключенного
        if self.player_id:
            await self.mark_player_disconnected(self.player_id)

            # Проверяем, был ли это ведущий
            is_host = await self.check_if_host(self.player_id)
            if is_host:
                # Ведущий отключился — паузим игру
                await self.auto_pause_on_host_disconnect()

        # Покидаем группу
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Получение сообщения от клиента"""
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')

            if msg_type == 'join':
                await self.handle_join(data)
            elif msg_type == 'become_host':
                await self.handle_become_host(data)
            elif msg_type == 'start_game':
                await self.handle_start_game(data)
            elif msg_type == 'answer':
                await self.handle_answer(data)
            elif msg_type == 'pause_game':
                await self.handle_pause_game(data)
            elif msg_type == 'resume_game':
                await self.handle_resume_game(data)
            elif msg_type == 'skip_question':
                await self.handle_skip_question(data)
            elif msg_type == 'end_game':
                await self.handle_end_game(data)
            elif msg_type == 'next_question':
                await self.handle_next_question(data)
            elif msg_type == 'ping':
                await self.handle_ping(data)
            elif msg_type == 'reaction':
                await self.handle_reaction(data)
            else:
                await self.send_error(f"Неизвестный тип сообщения: {msg_type}")

        except json.JSONDecodeError:
            await self.send_error("Неверный формат JSON")
        except Exception as e:
            await self.send_error(f"Ошибка обработки: {str(e)}")

    # ========================================================================
    # ОБРАБОТЧИКИ СОБЫТИЙ
    # ========================================================================

    async def handle_join(self, data):
        """Присоединение к игре"""
        player_name = data.get('player_name')

        if not player_name:
            await self.send_error("Требуется player_name")
            return

        # Создаём или восстанавливаем игрока
        player = await self.get_or_create_player(self.session_code, player_name)
        self.player_id = player['id']

        # Обновляем heartbeat
        await self.update_player_heartbeat(self.player_id)

        # Отправляем подтверждение
        await self.send(text_data=json.dumps({
            'type': 'joined',
            'player': player
        }))

        # Broadcast всем о новом игроке
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_joined',
                'player': player
            }
        )

        # Отправляем состояние сессии
        await self.send_session_state()

    async def handle_become_host(self, data):
        """Стать ведущим"""
        if not self.player_id:
            await self.send_error("Сначала присоединитесь к игре")
            return

        # Проверяем, нет ли уже ведущего
        has_host = await self.check_has_host()
        if has_host:
            await self.send_error("Ведущий уже выбран")
            return

        # Назначаем ведущим
        await self.assign_host(self.player_id)

        # Broadcast всем
        player = await self.get_player_data(self.player_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'host_assigned',
                'player': player
            }
        )

    async def handle_start_game(self, data):
        """Запуск игры (только ведущий)"""
        if not await self.verify_host():
            return

        # Меняем состояние на running
        await self.update_session_state('running')

        # Broadcast о старте
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_started',
            }
        )

        # Показываем первый вопрос
        await self.show_next_question()

    async def handle_answer(self, data):
        """Обработка ответа игрока"""
        if not self.player_id:
            await self.send_error("Сначала присоединитесь к игре")
            return

        question_uuid = data.get('question_uuid')
        choice_id = data.get('choice_id')
        time_taken = data.get('time_taken', 0)

        if not question_uuid or not choice_id:
            await self.send_error("Требуются question_uuid и choice_id")
            return

        # Сохраняем ответ
        result = await self.save_answer(
            self.player_id, question_uuid, choice_id, time_taken
        )

        if result is None:
            await self.send_error("Не удалось сохранить ответ")
            return

        # Отправляем подтверждение игроку
        await self.send(text_data=json.dumps({
            'type': 'answer_received',
            'is_correct': result['is_correct'],
            'points_earned': result['points_earned'],
            'reply': result['reply']
        }))

        # Обновляем статистику для всех
        await self.send_answer_stats()

        # НОВОЕ: Проверяем, все ли ответили
        all_answered = await self.check_all_answered(question_uuid)

        if all_answered:
            print("✅ Все ответили! Переходим к результатам...")
            await asyncio.sleep(2)  # Даём 2 сек посмотреть на свой результат

            await self.show_question_results(question_uuid)
            await asyncio.sleep(5)  # Показываем результаты 5 сек

            has_more = await self.has_more_questions()

            if has_more:
                print("➡️ Следующий вопрос...")
                await self.show_next_question()
            else:
                print("🏁 Игра окончена!")
                await self.finish_game()

    @database_sync_to_async
    def check_all_answered(self, question_uuid):
        """Проверяем, все ли ответили"""
        session = GameSession.objects.get(code=self.session_code)
        question = Question.objects.get(uuid=question_uuid)

        connected_players = session.players.filter(connected=True).count()
        answers_count = Answer.objects.filter(
            player__session=session,
            question=question
        ).count()

        print(f"📊 Ответили: {answers_count}/{connected_players}")
        return answers_count >= connected_players

    @database_sync_to_async
    def has_more_questions(self):
        """Есть ли ещё вопросы"""
        session = GameSession.objects.get(code=self.session_code)
        total_questions = session.quiz.questions.count()
        has_more = session.current_question < total_questions

        print(f"❓ Индекс: {session.current_question}/{total_questions}, Есть ещё: {has_more}")
        return has_more

    async def show_question_results(self, question_uuid):
        """Показать результаты вопроса"""
        print("📈 Показываем результаты...")

        question_data = await self.get_question_with_answer(question_uuid)
        leaderboard = await self.get_leaderboard()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'question_result',
                'question': question_data,
                'leaderboard': leaderboard
            }
        )

    @database_sync_to_async
    def get_question_with_answer(self, question_uuid):
        """Получить вопрос с правильным ответом"""
        from .serializers import QuestionSerializer
        question = Question.objects.get(uuid=question_uuid)
        return QuestionSerializer(question).data

    async def handle_pause_game(self, data):
        """Пауза (только ведущий)"""
        if not await self.verify_host():
            return

        await self.update_session_state('paused')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_paused',
            }
        )

    async def handle_resume_game(self, data):
        """Продолжить (только ведущий)"""
        if not await self.verify_host():
            return

        await self.update_session_state('running')

        # Countdown 3-2-1
        for i in range(3, 0, -1):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'countdown',
                    'count': i
                }
            )
            await asyncio.sleep(1)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_resumed',
            }
        )

    async def handle_skip_question(self, data):
        """Пропустить вопрос (только ведущий, первые 5-10 сек)"""
        if not await self.verify_host():
            return

        # TODO: Проверить что прошло менее 10 сек с начала вопроса

        # Помечаем вопрос как пропущенный (не начисляем баллы никому)
        await self.skip_current_question()

        # Показываем следующий вопрос
        await self.show_next_question()

    async def handle_end_game(self, data):
        """Завершить игру досрочно (только ведущий)"""
        if not await self.verify_host():
            return

        await self.finish_game()

    async def handle_next_question(self, data):
        """Следующий вопрос (только ведущий, если автопилот выкл)"""
        if not await self.verify_host():
            return

        await self.show_next_question()

    async def handle_ping(self, data):
        """Heartbeat"""
        if self.player_id:
            await self.update_player_heartbeat(self.player_id)

        await self.send(text_data=json.dumps({
            'type': 'pong'
        }))

    async def handle_reaction(self, data):
        """Эмодзи реакция"""
        if not self.player_id:
            return

        emoji = data.get('emoji')
        if not emoji:
            return

        # Rate limiting: 500ms между реакциями
        import time
        now = time.time()
        last_reaction = self.reaction_timestamps.get(self.player_id, 0)

        if now - last_reaction < 0.5:
            await self.send_error("Слишком быстро! Подожди немного")
            return

        self.reaction_timestamps[self.player_id] = now

        # Broadcast реакции
        player = await self.get_player_data(self.player_id)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_reaction',
                'player_id': self.player_id,
                'player_name': player['name'],
                'emoji': emoji
            }
        )

    # ========================================================================
    # ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    # ========================================================================

    async def show_next_question(self):
        """Показать следующий вопрос"""
        # Получаем ТЕКУЩИЙ вопрос
        question_data = await self.get_next_question()

        if question_data is None:
            # Вопросов больше нет — игра окончена
            await self.finish_game()
            return

        # Broadcast вопроса всем
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'question',
                'question': question_data
            }
        )

        # ПОСЛЕ показа вопроса переходим к следующему
        # (подготовка для следующего вызова show_next_question)
        await self.move_to_next_question()

    async def finish_game(self):
        """Завершение игры"""
        await self.update_session_state('finished')

        # Получаем финальную таблицу лидеров
        leaderboard = await self.get_leaderboard()

        # Рассчитываем награды
        awards = await self.calculate_awards()

        # Broadcast финала
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'leaderboard': leaderboard,
                'awards': awards
            }
        )

    async def send_session_state(self):
        """Отправить состояние сессии"""
        state = await self.get_session_state()

        await self.send(text_data=json.dumps({
            'type': 'session_state',
            **state
        }))

    async def send_answer_stats(self):
        """Отправить статистику ответов"""
        stats = await self.get_answer_stats()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'answer_stats',
                **stats
            }
        )

    async def send_error(self, message):
        """Отправить ошибку"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    async def verify_host(self):
        """Проверка что это ведущий"""
        if not self.player_id:
            await self.send_error("Сначала присоединитесь к игре")
            return False

        is_host = await self.check_if_host(self.player_id)
        if not is_host:
            await self.send_error("Только ведущий может это сделать")
            return False

        return True

    async def auto_pause_on_host_disconnect(self):
        """Автоматическая пауза при отключении ведущего"""
        # Проверяем что игра идёт
        state = await self.get_current_state()
        if state != 'running':
            return

        await self.update_session_state('paused')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'host_disconnected',
                'message': 'Ведущий отключился, ждём...'
            }
        )

    # ========================================================================
    # ОБРАБОТЧИКИ BROADCAST СОБЫТИЙ
    # ========================================================================

    async def player_joined(self, event):
        """Broadcast: игрок присоединился"""
        await self.send(text_data=json.dumps(event))

    async def host_assigned(self, event):
        """Broadcast: назначен ведущий"""
        await self.send(text_data=json.dumps(event))

    async def game_started(self, event):
        """Broadcast: игра началась"""
        await self.send(text_data=json.dumps(event))

    async def question(self, event):
        """Broadcast: новый вопрос"""
        await self.send(text_data=json.dumps(event))

    async def answer_stats(self, event):
        """Broadcast: статистика ответов"""
        await self.send(text_data=json.dumps(event))

    async def game_paused(self, event):
        """Broadcast: игра на паузе"""
        await self.send(text_data=json.dumps(event))

    async def countdown(self, event):
        """Broadcast: обратный отсчёт"""
        await self.send(text_data=json.dumps(event))

    async def game_resumed(self, event):
        """Broadcast: игра продолжена"""
        await self.send(text_data=json.dumps(event))

    async def game_over(self, event):
        """Broadcast: игра окончена"""
        await self.send(text_data=json.dumps(event))

    async def host_disconnected(self, event):
        """Broadcast: ведущий отключился"""
        await self.send(text_data=json.dumps(event))

    async def player_reaction(self, event):
        """Broadcast: эмодзи реакция"""
        await self.send(text_data=json.dumps(event))

    async def question_result(self, event):
        """Broadcast: результаты вопроса"""
        await self.send(text_data=json.dumps(event))

    async def answer_stats(self, event):
        """Broadcast: статистика ответов"""
        await self.send(text_data=json.dumps(event))

    # ========================================================================
    # РАБОТА С БАЗОЙ ДАННЫХ (database_sync_to_async)
    # ========================================================================

    @database_sync_to_async
    def check_session_exists(self):
        """Проверка что сессия существует"""
        return GameSession.objects.filter(code=self.session_code).exists()

    @database_sync_to_async
    def get_or_create_player(self, session_code, player_name):
        """Получить или создать игрока"""
        session = GameSession.objects.get(code=session_code)

        # Пытаемся найти существующего игрока
        player, created = Player.objects.get_or_create(
            session=session,
            name=player_name,
            defaults={'connected': True}
        )

        if not created:
            # Переподключение
            player.connected = True
            player.update_last_seen()
            player.save()

        return PlayerSerializer(player).data

    @database_sync_to_async
    def update_player_heartbeat(self, player_id):
        """Обновить last_seen"""
        try:
            player = Player.objects.get(id=player_id)
            player.update_last_seen()
        except Player.DoesNotExist:
            pass

    @database_sync_to_async
    def mark_player_disconnected(self, player_id):
        """Пометить игрока как отключенного"""
        try:
            player = Player.objects.get(id=player_id)
            player.connected = False
            player.save()
        except Player.DoesNotExist:
            pass

    @database_sync_to_async
    def check_if_host(self, player_id):
        """Проверка что игрок — ведущий"""
        try:
            player = Player.objects.get(id=player_id)
            return player.is_host
        except Player.DoesNotExist:
            return False

    @database_sync_to_async
    def check_has_host(self):
        """Проверка наличия ведущего"""
        session = GameSession.objects.get(code=self.session_code)
        return session.host is not None

    @database_sync_to_async
    def assign_host(self, player_id):
        """Назначить ведущего"""
        player = Player.objects.get(id=player_id)
        session = player.session

        player.is_host = True
        player.save()

        session.host = player
        session.save()

    @database_sync_to_async
    def update_session_state(self, state):
        """Обновить состояние сессии"""
        session = GameSession.objects.get(code=self.session_code)
        session.state = state
        session.save()

    @database_sync_to_async
    def get_current_state(self):
        """Получить текущее состояние"""
        session = GameSession.objects.get(code=self.session_code)
        return session.state

    @database_sync_to_async
    def get_next_question(self):
        """Получить текущий вопрос БЕЗ изменения счётчика"""
        session = GameSession.objects.get(code=self.session_code)

        # Получаем ТЕКУЩИЙ вопрос (не увеличиваем счётчик!)
        question = session.get_current_question()

        if question is None:
            return None

        return QuestionForPlayerSerializer(question).data

    @database_sync_to_async
    def move_to_next_question(self):
        """Переход к следующему вопросу"""
        session = GameSession.objects.get(code=self.session_code)
        session.current_question += 1
        session.save()
        return session.current_question

    @database_sync_to_async
    def skip_current_question(self):
        """Пропустить текущий вопрос"""
        # Просто увеличиваем счётчик без начисления баллов
        pass

    @database_sync_to_async
    def save_answer(self, player_id, question_uuid, choice_id, time_taken):
        """Сохранить ответ и рассчитать очки"""
        try:
            from .scoring import calculate_score
            from .prompts import get_reply  # Этап 4

            player = Player.objects.get(id=player_id)
            question = Question.objects.get(uuid=question_uuid)
            choice = Choice.objects.get(id=choice_id)

            # Проверяем правильность
            is_correct = choice.is_correct

            # Рассчитываем очки
            points = calculate_score(
                is_correct=is_correct,
                time_taken=time_taken,
                time_limit=question.get_time_limit(),
                current_streak=player.current_streak,
                difficulty=question.difficulty
            )

            # Сохраняем ответ
            Answer.objects.create(
                player=player,
                question=question,
                choice=choice,
                time_taken=time_taken,
                is_correct=is_correct,
                points_earned=points
            )

            # Обновляем игрока
            player.increment_score(points)
            if is_correct:
                player.increment_streak()
            else:
                player.reset_streak()

            # Получаем мотивирующую фразу
            try:
                reply = get_reply(is_correct, question.difficulty, question.quiz.topic)
            except:
                reply = "Правильно!" if is_correct else "Неправильно"

            return {
                'is_correct': is_correct,
                'points_earned': points,
                'reply': reply
            }

        except Exception as e:
            print(f"Error saving answer: {e}")
            return None

    @database_sync_to_async
    def get_session_state(self):
        """Получить состояние сессии"""
        session = GameSession.objects.get(code=self.session_code)
        return GameSessionSerializer(session).data

    @database_sync_to_async
    def get_player_data(self, player_id):
        """Получить данные игрока"""
        player = Player.objects.get(id=player_id)
        return PlayerSerializer(player).data

    @database_sync_to_async
    def get_answer_stats(self):
        """Получить статистику ответов на текущий вопрос"""
        session = GameSession.objects.get(code=self.session_code)
        question = session.get_current_question()

        if not question:
            return {}

        # Сколько ответили
        total_players = session.players.filter(connected=True).count()
        answered_count = Answer.objects.filter(
            player__session=session,
            question=question
        ).count()

        # Сколько правильных
        correct_count = Answer.objects.filter(
            player__session=session,
            question=question,
            is_correct=True
        ).count()

        return {
            'answered': f"{answered_count}/{total_players}",
            'correct': correct_count
        }

    @database_sync_to_async
    def get_leaderboard(self):
        """Получить таблицу лидеров"""
        session = GameSession.objects.get(code=self.session_code)
        players = session.players.all().order_by('-score', 'joined_at')

        return [
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

    @database_sync_to_async
    def calculate_awards(self):
        '''Рассчитать награды для финального экрана'''
        from .awards import calculate_awards

        session = GameSession.objects.get(code=self.session_code)
        return calculate_awards(session)