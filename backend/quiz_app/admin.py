# quiz_app/admin.py

from django.contrib import admin
from .models import Quiz, Question, Choice, GameSession, Player, Answer


class ChoiceInline(admin.TabularInline):
    """Варианты ответов внутри вопроса"""
    model = Choice
    extra = 4
    max_num = 4
    fields = ['order', 'text', 'is_correct']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'topic', 'question_count', 'time_per_question', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'topic']
    readonly_fields = ['created_at', 'question_count']

    fieldsets = [
        ('Основная информация', {
            'fields': ['title', 'topic', 'description']
        }),
        ('Медиа', {
            'fields': ['image_url']
        }),
        ('Настройки', {
            'fields': ['time_per_question', 'question_count']
        }),
        ('Метаданные', {
            'fields': ['created_at'],
            'classes': ['collapse']
        }),
    ]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'order', 'text_preview', 'difficulty', 'time_limit', 'generated_by_model']
    list_filter = ['quiz', 'difficulty', 'generated_by_model']
    search_fields = ['text', 'explanation']
    inlines = [ChoiceInline]
    readonly_fields = ['uuid', 'created_at']

    fieldsets = [
        ('Основная информация', {
            'fields': ['quiz', 'order', 'text', 'difficulty', 'time_limit']
        }),
        ('Дополнительно', {
            'fields': ['explanation', 'image_url']
        }),
        ('Метаданные', {
            'fields': ['uuid', 'generated_by_model', 'created_at'],
            'classes': ['collapse']
        }),
    ]

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text

    text_preview.short_description = 'Текст вопроса'


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ['question', 'order', 'text', 'is_correct']
    list_filter = ['is_correct', 'question__quiz']
    search_fields = ['text']


class PlayerInline(admin.TabularInline):
    """Игроки внутри сессии"""
    model = Player
    extra = 0
    fields = ['name', 'score', 'current_streak', 'connected', 'is_host']
    readonly_fields = ['score', 'current_streak']


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['code', 'quiz', 'state', 'player_count', 'current_question', 'created_at']
    list_filter = ['state', 'created_at']
    search_fields = ['code', 'quiz__title']
    inlines = [PlayerInline]
    readonly_fields = ['code', 'created_at', 'started_at', 'finished_at']

    fieldsets = [
        ('Основная информация', {
            'fields': ['quiz', 'code', 'state']
        }),
        ('Игровой процесс', {
            'fields': ['current_question', 'host']
        }),
        ('Временные метки', {
            'fields': ['created_at', 'started_at', 'finished_at'],
            'classes': ['collapse']
        }),
    ]

    def player_count(self, obj):
        connected = obj.get_connected_players_count()
        total = obj.players.count()
        return f"{connected}/{total}"

    player_count.short_description = 'Игроки (подключено/всего)'


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'session_code', 'score', 'current_streak', 'connected', 'is_host']
    list_filter = ['connected', 'is_host', 'session__state']
    search_fields = ['name', 'session__code']
    readonly_fields = ['joined_at', 'last_seen']

    fieldsets = [
        ('Основная информация', {
            'fields': ['session', 'name', 'is_host']
        }),
        ('Игровая статистика', {
            'fields': ['score', 'current_streak', 'max_streak']
        }),
        ('Статус подключения', {
            'fields': ['connected', 'last_seen', 'joined_at']
        }),
    ]

    def session_code(self, obj):
        return obj.session.code

    session_code.short_description = 'Код сессии'


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['player', 'question_short', 'is_correct', 'points_earned', 'time_taken', 'answered_at']
    list_filter = ['is_correct', 'player__session__code']
    search_fields = ['player__name', 'question__text']
    readonly_fields = ['answered_at']

    fieldsets = [
        ('Основная информация', {
            'fields': ['player', 'question', 'choice']
        }),
        ('Результат', {
            'fields': ['is_correct', 'points_earned', 'time_taken']
        }),
        ('Метаданные', {
            'fields': ['answered_at'],
            'classes': ['collapse']
        }),
    ]

    def question_short(self, obj):
        return f"Q{obj.question.order}"

    question_short.short_description = 'Вопрос'