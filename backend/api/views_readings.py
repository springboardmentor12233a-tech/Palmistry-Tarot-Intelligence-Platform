from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Reading, TarotReading

class ReadingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        readings = Reading.objects.filter(user=request.user).order_by('-created_at')
        data = []
        for r in readings:
            data.append({
                "id": str(r.id),
                "reading_type": r.reading_type,
                "status": r.status,
                "reading_confidence": r.reading_confidence,
                "created_at": r.created_at,
                "overall_insight": r.overall_insight
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        reading = Reading.objects.create(
            user=request.user,
            reading_type="combined",
            status="started"
        )
        return Response({"id": str(reading.id), "status": reading.status}, status=status.HTTP_201_CREATED)

class ReadingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            r = Reading.objects.get(id=pk, user=request.user)
            tarot_data = None
            if r.tarot_reading:
                tarot_data = {
                    "id": str(r.tarot_reading.id),
                    "cards": [
                        {
                            "name": c.card.name,
                            "position": c.position,
                            "orientation": c.orientation,
                            "image_url": c.card.image_url,
                            "interpretation": c.interpretation
                        } for c in r.tarot_reading.cards.all()
                    ]
                }
            data = {
                "id": str(r.id),
                "reading_type": r.reading_type,
                "status": r.status,
                "question": r.question,
                "palm_features": r.palm_features,
                "palm_interpretation": r.palm_interpretation,
                "tarot_reading": tarot_data,
                "synthesis_interpretation": r.synthesis_interpretation,
                "overall_insight": r.overall_insight,
                "reading_confidence": r.reading_confidence,
                "pdf_report_path": r.pdf_report_path,
                "created_at": r.created_at
            }
            return Response(data, status=status.HTTP_200_OK)
        except Reading.DoesNotExist:
            return Response({"detail": "Reading not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        try:
            r = Reading.objects.get(id=pk, user=request.user)
            data = request.data
            
            if 'status' in data:
                r.status = data['status']
            if 'palm_features' in data:
                r.palm_features = data['palm_features']
            if 'palm_interpretation' in data:
                r.palm_interpretation = data['palm_interpretation']
            if 'tarot_reading_id' in data:
                r.tarot_reading_id = data['tarot_reading_id']
            if 'question' in data:
                r.question = data['question']
                
            r.save()
            return Response({"detail": "Reading updated", "status": r.status}, status=status.HTTP_200_OK)
        except Reading.DoesNotExist:
            return Response({"detail": "Reading not found."}, status=status.HTTP_404_NOT_FOUND)
