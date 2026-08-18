from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, AnalyzePalmView, UpdateProfileView, ChangePasswordView
from .views_tarot import (
    TarotCardListView, TarotSpreadsView, TarotReadingCreateView,
    TarotReadingShuffleView, TarotReadingSelectView, TarotReadingDetailView,
    TarotHistoryView
)
from .views_ai import PalmInterpretView, SynthesisView, ReadingChatView
from .views_readings import ReadingListCreateView, ReadingDetailView
from .views_pdf import PDFGenerateView

from .views_admin import AdminDashboardStatsView, AdminUserListView, AdminReadingsAnalysisView, AdminUpdatePredictionView

urlpatterns = [
    path('auth/register', RegisterView.as_view(), name='auth_register'),
    path('auth/login', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/profile/update', UpdateProfileView.as_view(), name='auth_profile_update'),
    path('auth/password/change', ChangePasswordView.as_view(), name='auth_password_change'),
    
    # Admin Endpoints
    path('admin/stats', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/users', AdminUserListView.as_view(), name='admin_users'),
    path('admin/analysis', AdminReadingsAnalysisView.as_view(), name='admin_analysis'),
    path('admin/analysis/<uuid:pk>/update', AdminUpdatePredictionView.as_view(), name='admin_analysis_update'),
    
    path('palm/analyze', AnalyzePalmView.as_view(), name='palm_analyze'),
    
    path('ai/palm/interpret', PalmInterpretView.as_view(), name='ai_palm_interpret'),
    path('ai/synthesis', SynthesisView.as_view(), name='ai_synthesis'),
    path('ai/chat', ReadingChatView.as_view(), name='ai_chat'),
    
    path('readings', ReadingListCreateView.as_view(), name='readings_list_create'),
    path('readings/<uuid:pk>', ReadingDetailView.as_view(), name='readings_detail'),
    
    path('reports/<uuid:pk>/generate', PDFGenerateView.as_view(), name='pdf_generate'),
    
    path('tarot/cards', TarotCardListView.as_view(), name='tarot_cards'),
    path('tarot/spreads', TarotSpreadsView.as_view(), name='tarot_spreads'),
    path('tarot/readings', TarotReadingCreateView.as_view(), name='tarot_readings_create'),
    path('tarot/readings/<uuid:pk>/shuffle', TarotReadingShuffleView.as_view(), name='tarot_readings_shuffle'),
    path('tarot/readings/<uuid:pk>/select', TarotReadingSelectView.as_view(), name='tarot_readings_select'),
    path('tarot/readings/<uuid:pk>', TarotReadingDetailView.as_view(), name='tarot_readings_detail'),
    path('tarot/history', TarotHistoryView.as_view(), name='tarot_history'),
]
