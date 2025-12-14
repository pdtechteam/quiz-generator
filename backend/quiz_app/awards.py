# ============================================================================
# ФАЙЛ 1: backend/quiz_app/awards.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

from dataclasses import dataclass
from typing import List, Optional, Callable
from django.db.models import Avg, Count, Q, F

from .models import GameSession, Player, Answer


@dataclass
class Award:
    """
    Награда в игре

    Attributes:
        key: уникальный ключ награды
        name: название награды
        emoji: эмодзи для отображения
        description: описание критерия
        checker: функция проверки (принимает player, answers)
    """
    key: str
    name: str
    emoji: str
    description: str
    checker: Callable


# ============================================================================
# ФУНКЦИИ ПРОВЕРКИ НАГРАД
# ============================================================================

def check_fastest(player, all_answers, threshold=3.0):
    """
    Проверка награды 'Молния' ⚡

    Критерий: средняя скорость ответа < 3 секунды (только правильные ответы)

    Args:
        player: экземпляр Player
        all_answers: список всех Answer в сессии
        threshold: порог в секундах

    Returns:
        tuple: (bool, float) - (заслужил награду?, среднее время)
    """
    correct_answers = [
        a for a in all_answers
        if a.player == player and a.is_correct
    ]

    if not correct_answers:
        return False, 0

    avg_time = sum(a.time_taken for a in correct_answers) / len(correct_answers)

    return avg_time < threshold, avg_time


def check_accurate(player, all_answers, threshold=0.85):
    """
    Проверка награды 'Снайпер' 🎯

    Критерий: точность > 85% правильных ответов

    Args:
        player: экземпляр Player
        all_answers: список всех Answer в сессии
        threshold: минимальная точность (0.0 - 1.0)

    Returns:
        tuple: (bool, float) - (заслужил награду?, точность)
    """
    player_answers = [a for a in all_answers if a.player == player]

    if not player_answers:
        return False, 0

    correct = sum(1 for a in player_answers if a.is_correct)
    accuracy = correct / len(player_answers)

    return accuracy >= threshold, accuracy


def check_clutch(player, all_answers, min_clutch=2):
    """
    Проверка награды 'Clutch мастер' 🔥

    Критерий: минимум 2 правильных ответа в последние 3 секунды таймера

    Args:
        player: экземпляр Player
        all_answers: список всех Answer в сессии
        min_clutch: минимальное количество clutch ответов

    Returns:
        tuple: (bool, int) - (заслужил награду?, количество clutch)
    """
    clutch_answers = [
        a for a in all_answers
        if a.player == player
           and a.is_correct
           and a.time_taken >= (a.question.time_limit - 3)
    ]

    clutch_count = len(clutch_answers)

    return clutch_count >= min_clutch, clutch_count


def check_strategist(player, all_answers, min_streak=5):
    """
    Проверка награды 'Стратег' 🧠

    Критерий: максимальный streak ≥ 5 правильных ответов подряд

    Args:
        player: экземпляр Player
        all_answers: список всех Answer в сессии
        min_streak: минимальный streak

    Returns:
        tuple: (bool, int) - (заслужил награду?, максимальный streak)
    """
    max_streak = player.max_streak

    return max_streak >= min_streak, max_streak


def check_lucky(player, all_answers, min_lucky=2):
    """
    Проверка награды 'Везунчик' 🎲

    Критерий: минимум 2 правильных ответа на hard/very_hard вопросы
              при времени ответа > 15 секунд

    Args:
        player: экземпляр Player
        all_answers: список всех Answer в сессии
        min_lucky: минимальное количество "везучих" ответов

    Returns:
        tuple: (bool, int) - (заслужил награду?, количество)
    """
    lucky_answers = [
        a for a in all_answers
        if a.player == player
           and a.is_correct
           and a.question.difficulty in ['hard', 'very_hard']
           and a.time_taken > 15
    ]

    lucky_count = len(lucky_answers)

    return lucky_count >= min_lucky, lucky_count


# ============================================================================
# СПИСОК ВСЕХ НАГРАД
# ============================================================================

AWARDS = [
    Award(
        key="fastest",
        name="Молния",
        emoji="⚡",
        description="Самая высокая средняя скорость ответа (< 3 сек)",
        checker=lambda p, ans: check_fastest(p, ans)[0]
    ),
    Award(
        key="accurate",
        name="Снайпер",
        emoji="🎯",
        description="Самая высокая точность (> 85%)",
        checker=lambda p, ans: check_accurate(p, ans)[0]
    ),
    Award(
        key="clutch",
        name="Clutch мастер",
        emoji="🔥",
        description="Минимум 2 ответа в последние 3 секунды",
        checker=lambda p, ans: check_clutch(p, ans)[0]
    ),
    Award(
        key="strategist",
        name="Стратег",
        emoji="🧠",
        description="Максимальный streak ≥ 5 правильных подряд",
        checker=lambda p, ans: check_strategist(p, ans)[0]
    ),
    Award(
        key="lucky",
        name="Везунчик",
        emoji="🎲",
        description="Правильные сложные ответы за последние секунды",
        checker=lambda p, ans: check_lucky(p, ans)[0]
    ),
]


# ============================================================================
# ГЛАВНАЯ ФУНКЦИЯ РАСЧЁТА НАГРАД
# ============================================================================

def calculate_awards(session: GameSession) -> dict:
    """
    Рассчитывает все награды для игровой сессии

    Логика:
    - Для каждой награды проверяем всех игроков
    - Выбираем лучшего по каждому критерию
    - Один игрок может получить несколько наград
    - Если никто не подходит — награда не выдаётся

    Args:
        session: GameSession экземпляр

    Returns:
        dict: {
            'fastest': {'player_id': 7, 'name': 'Иван', 'emoji': '⚡', 'value': 2.5},
            'accurate': {'player_id': 8, 'name': 'Мария', 'emoji': '🎯', 'value': 0.92},
            ...
        }
    """
    players = session.players.all()
    all_answers = list(Answer.objects.filter(player__session=session).select_related('question', 'player'))

    results = {}

    # ========================================================================
    # НАГРАДА 1: ⚡ МОЛНИЯ (Fastest)
    # ========================================================================

    fastest_candidates = []
    for player in players:
        eligible, avg_time = check_fastest(player, all_answers)
        if eligible:
            fastest_candidates.append((player, avg_time))

    if fastest_candidates:
        # Выбираем игрока с минимальным временем
        winner = min(fastest_candidates, key=lambda x: x[1])
        results['fastest'] = {
            'player_id': winner[0].id,
            'name': winner[0].name,
            'emoji': '⚡',
            'value': round(winner[1], 2),
            'description': f'Средняя скорость: {winner[1]:.2f}s'
        }

    # ========================================================================
    # НАГРАДА 2: 🎯 СНАЙПЕР (Accurate)
    # ========================================================================

    accurate_candidates = []
    for player in players:
        eligible, accuracy = check_accurate(player, all_answers)
        if eligible:
            accurate_candidates.append((player, accuracy))

    if accurate_candidates:
        # Выбираем игрока с максимальной точностью
        winner = max(accurate_candidates, key=lambda x: x[1])
        results['accurate'] = {
            'player_id': winner[0].id,
            'name': winner[0].name,
            'emoji': '🎯',
            'value': round(winner[1] * 100, 1),
            'description': f'Точность: {winner[1] * 100:.1f}%'
        }

    # ========================================================================
    # НАГРАДА 3: 🔥 CLUTCH МАСТЕР
    # ========================================================================

    clutch_candidates = []
    for player in players:
        eligible, clutch_count = check_clutch(player, all_answers)
        if eligible:
            clutch_candidates.append((player, clutch_count))

    if clutch_candidates:
        # Выбираем игрока с максимальным количеством clutch
        winner = max(clutch_candidates, key=lambda x: x[1])
        results['clutch'] = {
            'player_id': winner[0].id,
            'name': winner[0].name,
            'emoji': '🔥',
            'value': winner[1],
            'description': f'Clutch ответов: {winner[1]}'
        }

    # ========================================================================
    # НАГРАДА 4: 🧠 СТРАТЕГ
    # ========================================================================

    strategist_candidates = []
    for player in players:
        eligible, max_streak = check_strategist(player, all_answers)
        if eligible:
            strategist_candidates.append((player, max_streak))

    if strategist_candidates:
        # Выбираем игрока с максимальным streak
        winner = max(strategist_candidates, key=lambda x: x[1])
        results['strategist'] = {
            'player_id': winner[0].id,
            'name': winner[0].name,
            'emoji': '🧠',
            'value': winner[1],
            'description': f'Макс. streak: {winner[1]}'
        }

    # ========================================================================
    # НАГРАДА 5: 🎲 ВЕЗУНЧИК
    # ========================================================================

    lucky_candidates = []
    for player in players:
        eligible, lucky_count = check_lucky(player, all_answers)
        if eligible:
            lucky_candidates.append((player, lucky_count))

    if lucky_candidates:
        # Выбираем игрока с максимальным количеством "везучих" ответов
        winner = max(lucky_candidates, key=lambda x: x[1])
        results['lucky'] = {
            'player_id': winner[0].id,
            'name': winner[0].name,
            'emoji': '🎲',
            'value': winner[1],
            'description': f'Везучих ответов: {winner[1]}'
        }

    return results


def get_player_awards(session: GameSession, player_id: int) -> List[dict]:
    """
    Возвращает список наград для конкретного игрока

    Args:
        session: GameSession экземпляр
        player_id: ID игрока

    Returns:
        list: [{'key': 'fastest', 'name': 'Молния', 'emoji': '⚡', ...}, ...]
    """
    all_awards = calculate_awards(session)

    player_awards = []
    for award_key, award_data in all_awards.items():
        if award_data['player_id'] == player_id:
            player_awards.append({
                'key': award_key,
                'name': AWARDS_DICT[award_key].name,
                'emoji': award_data['emoji'],
                'description': award_data['description']
            })

    return player_awards


# Словарь для быстрого доступа к наградам
AWARDS_DICT = {award.key: award for award in AWARDS}


def get_session_statistics(session: GameSession) -> dict:
    """
    Возвращает детальную статистику по сессии

    Args:
        session: GameSession экземпляр

    Returns:
        dict: {
            'total_players': 8,
            'total_questions': 10,
            'total_answers': 80,
            'average_score': 5250.5,
            'average_accuracy': 0.75,
            'fastest_answer': {'player': 'Иван', 'time': 1.2},
            'slowest_answer': {'player': 'Мария', 'time': 19.8},
            ...
        }
    """
    players = session.players.all()
    answers = Answer.objects.filter(player__session=session)

    # Базовая статистика
    total_players = players.count()
    total_questions = session.quiz.question_count
    total_answers = answers.count()

    # Средний счёт
    avg_score = players.aggregate(Avg('score'))['score__avg'] or 0

    # Средняя точность
    correct_answers = answers.filter(is_correct=True).count()
    avg_accuracy = correct_answers / total_answers if total_answers > 0 else 0

    # Самый быстрый ответ
    fastest = answers.filter(is_correct=True).order_by('time_taken').first()
    fastest_data = None
    if fastest:
        fastest_data = {
            'player': fastest.player.name,
            'time': round(fastest.time_taken, 2),
            'question': fastest.question.text[:50]
        }

    # Самый медленный правильный ответ
    slowest = answers.filter(is_correct=True).order_by('-time_taken').first()
    slowest_data = None
    if slowest:
        slowest_data = {
            'player': slowest.player.name,
            'time': round(slowest.time_taken, 2),
            'question': slowest.question.text[:50]
        }

    # Самый сложный вопрос (меньше всего правильных ответов)
    from django.db.models import Count
    hardest_question = (
        Answer.objects
        .filter(player__session=session)
        .values('question__text', 'question__difficulty')
        .annotate(
            correct_count=Count('id', filter=Q(is_correct=True)),
            total_count=Count('id')
        )
        .order_by('correct_count')
        .first()
    )

    return {
        'total_players': total_players,
        'total_questions': total_questions,
        'total_answers': total_answers,
        'average_score': round(avg_score, 1),
        'average_accuracy': round(avg_accuracy * 100, 1),
        'fastest_answer': fastest_data,
        'slowest_answer': slowest_data,
        'hardest_question': hardest_question,
    }