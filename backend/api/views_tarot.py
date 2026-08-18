from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import TarotCard, TarotReading, TarotReadingCard
from .serializers import TarotCardSerializer, TarotReadingSerializer
from .services.tarot_engine import tarot_engine_service

class TarotCardListView(generics.ListAPIView):
    queryset = TarotCard.objects.all()
    serializer_class = TarotCardSerializer
    permission_classes = (IsAuthenticated,)

class TarotSpreadsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        spreads = tarot_engine_service.get_spreads()
        return Response(spreads, status=status.HTTP_200_OK)

class TarotReadingCreateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        reading_type = request.data.get('reading_type')
        question = request.data.get('question', '')
        
        spreads = tarot_engine_service.get_spreads()
        if reading_type not in spreads:
            return Response({"detail": "Invalid spread type."}, status=status.HTTP_400_BAD_REQUEST)
            
        reading = TarotReading.objects.create(
            user=request.user,
            reading_type=reading_type,
            question=question
        )
        
        serializer = TarotReadingSerializer(reading)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TarotReadingShuffleView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        try:
            reading = TarotReading.objects.get(pk=pk, user=request.user)
        except TarotReading.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        reading.cards.all().delete()
        shuffled_ids = tarot_engine_service.shuffle_deck()
        return Response({"shuffled_deck": shuffled_ids}, status=status.HTTP_200_OK)

class TarotReadingSelectView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        try:
            reading = TarotReading.objects.get(pk=pk, user=request.user)
        except TarotReading.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        card_id = request.data.get('card_id')
        position_id = request.data.get('position_id')
        
        try:
            card = TarotCard.objects.get(id=card_id)
        except TarotCard.DoesNotExist:
            return Response({"detail": "Card not found."}, status=status.HTTP_400_BAD_REQUEST)
            
        if reading.cards.filter(card=card).exists():
            return Response({"detail": "Card already selected."}, status=status.HTTP_400_BAD_REQUEST)
            
        spreads = tarot_engine_service.get_spreads()
        spread_def = spreads.get(reading.reading_type)
        position_def = next((p for p in spread_def['positions'] if str(p['id']) == str(position_id)), None)
        
        if not position_def:
            return Response({"detail": "Invalid position."}, status=status.HTTP_400_BAD_REQUEST)
            
        orientation = tarot_engine_service.assign_orientation()
        
        reading_card = TarotReadingCard.objects.create(
            reading=reading,
            card=card,
            position=position_def['name'],
            orientation=orientation
        )
        
        reading.refresh_from_db()
        serializer = TarotReadingSerializer(reading)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TarotReadingDetailView(generics.RetrieveAPIView):
    serializer_class = TarotReadingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TarotReading.objects.filter(user=self.request.user)

class TarotHistoryView(generics.ListAPIView):
    serializer_class = TarotReadingSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return TarotReading.objects.filter(user=self.request.user).order_by('-created_at')
