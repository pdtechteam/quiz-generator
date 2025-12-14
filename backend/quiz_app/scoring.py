# ============================================================================
# ФАЙЛ 1: backend/quiz_app/scoring.py (СОЗДАЙ НОВЫЙ ФАЙЛ)
# ============================================================================

def calculate_score(is_correct, time_taken, time_limit, current_streak, difficulty):
    """
    Рассчитывает очки за ответ

    Формула:
    - Базовые очки: 1000
    - Бонус за скорость: до +500 (чем быстрее, тем больше)
    - Бонус за streak: +100 за каждый правильный подряд
    - Множитель сложности: easy=0.8, medium=1.0, hard=1.3, very_hard=1.5, fun=0.5

    Args:
        is_correct: правильный ли ответ
        time_taken: время ответа в секундах
        time_limit: лимит времени на вопрос
        current_streak: текущая серия правильных ответов
        difficulty: сложность вопроса

    Returns:
        int: количество очков (0 если неправильный)
    """
    if not is_correct:
        return 0

    # Базовые очки
    base_points = 1000

    # Бонус за скорость (чем быстрее ответил, тем больше)
    speed_ratio = 1 - (time_taken / time_limit)
    speed_bonus = int(speed_ratio * 500)
    speed_bonus = max(0, speed_bonus)  # не меньше 0

    # Streak бонус
    streak_bonus = current_streak * 100

    # Множитель сложности
    difficulty_multiplier = {
        'easy': 0.8,
        'medium': 1.0,
        'hard': 1.3,
        'very_hard': 1.5,
        'fun': 0.5,  # fun вопросы дают меньше очков
    }
    multiplier = difficulty_multiplier.get(difficulty, 1.0)

    # Итоговый расчёт
    total = int((base_points + speed_bonus + streak_bonus) * multiplier)

    return total


def get_score_breakdown(is_correct, time_taken, time_limit, current_streak, difficulty):
    """
    Возвращает детальную разбивку очков (для отладки/статистики)

    Returns:
        dict: {'base': 1000, 'speed': 450, 'streak': 300, 'multiplier': 1.3, 'total': 2275}
    """
    if not is_correct:
        return {
            'base': 0,
            'speed': 0,
            'streak': 0,
            'multiplier': 0,
            'total': 0
        }

    base_points = 1000
    speed_ratio = 1 - (time_taken / time_limit)
    speed_bonus = int(speed_ratio * 500)
    speed_bonus = max(0, speed_bonus)
    streak_bonus = current_streak * 100

    difficulty_multiplier = {
        'easy': 0.8,
        'medium': 1.0,
        'hard': 1.3,
        'very_hard': 1.5,
        'fun': 0.5,
    }
    multiplier = difficulty_multiplier.get(difficulty, 1.0)

    total = int((base_points + speed_bonus + streak_bonus) * multiplier)

    return {
        'base': base_points,
        'speed': speed_bonus,
        'streak': streak_bonus,
        'multiplier': multiplier,
        'total': total
    }