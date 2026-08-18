from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.utils import timezone
from datetime import timedelta
from .models import User, Reading

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'Admin')

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_readings = Reading.objects.count()
        
        # Determine online users (active in the last 15 minutes)
        threshold = timezone.now() - timedelta(minutes=15)
        online_users = User.objects.filter(last_active__gte=threshold).count()
        
        return Response({
            "total_users": total_users,
            "total_readings": total_readings,
            "online_users": online_users
        }, status=status.HTTP_200_OK)

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-last_active')
        threshold = timezone.now() - timedelta(minutes=15)
        
        user_data = []
        for u in users:
            is_online = u.last_active >= threshold if u.last_active else False
            user_data.append({
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "last_active": u.last_active,
                "is_online": is_online
            })
            
        return Response(user_data, status=status.HTTP_200_OK)

class AdminReadingsAnalysisView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        readings = Reading.objects.all().order_by('-created_at')
        
        reading_data = []
        for r in readings:
            # Extract a 2-3 word prediction from overall_insight
            prediction = "No prediction"
            if r.overall_insight:
                words = r.overall_insight.split()
                prediction = " ".join(words[:3]) + "..." if len(words) > 3 else r.overall_insight
                
            hand_image = None
            if r.palm_features and isinstance(r.palm_features, dict):
                hand_image = r.palm_features.get('marked_image')
                
            tarot_cards = []
            if r.tarot_reading:
                for reading_card in r.tarot_reading.cards.all():
                    tarot_cards.append({
                        "name": reading_card.card.name,
                        "image_url": reading_card.card.image_url
                    })
                
            reading_data.append({
                "id": r.id,
                "user_email": r.user.email if r.user else "Unknown",
                "hand_image": hand_image,
                "tarot_cards": tarot_cards,
                "short_prediction": prediction,
                "status": r.status,
                "created_at": r.created_at,
                "pdf_report_path": r.pdf_report_path
            })
            
        return Response(reading_data, status=status.HTTP_200_OK)

class AdminUpdatePredictionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, pk):
        try:
            r = Reading.objects.get(id=pk)
            new_insight = request.data.get('overall_insight')
            if new_insight:
                r.overall_insight = new_insight
                
                # Optionally update the nested synthesis JSON if needed
                if r.synthesis_interpretation and isinstance(r.synthesis_interpretation, dict):
                    r.synthesis_interpretation['overall_insight'] = new_insight
                    
                r.save()
                return Response({"detail": "Prediction updated successfully."}, status=status.HTTP_200_OK)
            return Response({"detail": "No new prediction provided."}, status=status.HTTP_400_BAD_REQUEST)
        except Reading.DoesNotExist:
            return Response({"detail": "Reading not found."}, status=status.HTTP_404_NOT_FOUND)
