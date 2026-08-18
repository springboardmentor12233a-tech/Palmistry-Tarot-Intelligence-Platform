import hashlib
import json
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import AIInterpretation
from .services.ai.palm_interpreter import palm_interpretation_service

class PalmInterpretView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        palm_features = request.data.get('features')
        if not palm_features:
            return Response({"detail": "Palm features are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user_context = {}
        if request.user and request.user.is_authenticated:
            user_context = {
                "spiritual_goals": request.user.spiritual_goals,
                "role": request.user.role
            }
            
        input_str = json.dumps(palm_features, sort_keys=True)
        input_hash = hashlib.sha256(input_str.encode()).hexdigest()
        
        reading_id = request.data.get('reading_id')
        
        user_id = request.user.id if request.user.is_authenticated else None
        cached_result = AIInterpretation.objects.filter(input_hash=input_hash, type='palm', user_id=user_id).first()
        
        if cached_result:
            interpretation = cached_result.response_json
        else:
            try:
                interpretation = palm_interpretation_service.interpret(palm_features, user_context)
                
                AIInterpretation.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    type='palm',
                    model_used='gpt-4o-mini',
                    input_hash=input_hash,
                    response_json=interpretation
                )
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                
        # Save to Reading model if reading_id is provided
        if reading_id:
            try:
                from .models import Reading
                r = Reading.objects.get(id=reading_id)
                r.palm_interpretation = interpretation
                r.save()
            except Exception as e:
                print(f"Failed to update reading with palm interpretation: {e}")
                
        return Response(interpretation, status=status.HTTP_200_OK)

class ReadingChatView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        reading_id = request.data.get('reading_id')
        question = request.data.get('question')

        if not reading_id or not question:
            return Response({"detail": "reading_id and question are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .models import Reading
            reading = Reading.objects.get(id=reading_id, user=request.user)
        except Reading.DoesNotExist:
            return Response({"detail": "Reading not found."}, status=status.HTTP_404_NOT_FOUND)

        # Prepare a summarized dict for the prompt
        reading_data = {
            "question": reading.question,
            "palm_interpretation": reading.palm_interpretation,
            "synthesis_interpretation": reading.synthesis_interpretation,
            "overall_insight": reading.overall_insight
        }

        from .services.llm_service import llm_service
        answer = llm_service.chat_with_reading(reading_data, question)

        return Response({"answer": answer}, status=status.HTTP_200_OK)


from .services.ai.synthesis_engine import synthesis_engine_service
from rest_framework.permissions import IsAuthenticated

class SynthesisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        reading_id = request.data.get('reading_id')
        if not reading_id:
            return Response({"detail": "reading_id required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .models import Reading
            r = Reading.objects.get(id=reading_id, user=request.user)
            
            palm_data = r.palm_features or {}
            tarot_data = {}
            if r.tarot_reading:
                tarot_data = {
                    "question": r.tarot_reading.question,
                    "cards": [c.card.name for c in r.tarot_reading.cards.all()]
                }
                
            user_context = {
                "spiritual_goals": request.user.spiritual_goals,
            }
            
            synthesis = synthesis_engine_service.synthesize(palm_data, tarot_data, user_context)
            
            cv_conf = palm_data.get('confidence', 0.5)
            r.reading_confidence = round((cv_conf * 0.3) + 0.55, 2)
            
            r.synthesis_interpretation = synthesis
            r.overall_insight = synthesis.get('overall_insight', '')
            r.status = 'ai_completed'
            r.save()
            
            return Response(synthesis, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
