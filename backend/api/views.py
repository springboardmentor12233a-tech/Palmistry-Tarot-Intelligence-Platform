from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UpdateProfileSerializer, ChangePasswordSerializer, UserSerializer
from .services.palm_engine import palm_engine_service
from .services.tarot_engine import tarot_engine_service
from .services.llm_service import llm_service

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UpdateProfileView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UpdateProfileSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            
            return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnalyzePalmView(APIView):
    # Depending on requirements, this might need IsAuthenticated
    # but the FastAPI version didn't seem to have auth enforced on the route itself.
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"detail": "File provided is not an image."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file_obj.content_type.startswith("image/"):
            return Response({"detail": "File provided is not an image."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            image_bytes = file_obj.read()
            # 1. Palm Engine CV extraction & validation
            palm_data = palm_engine_service.process_image(image_bytes)
            
            if "error" in palm_data:
                return Response({"detail": palm_data["error"]}, status=status.HTTP_400_BAD_REQUEST)
                
            reading_id = request.data.get('reading_id')
            if reading_id:
                try:
                    from .models import Reading
                    r = Reading.objects.get(id=reading_id)
                    r.palm_features = palm_data
                    if r.status == 'started':
                        r.status = 'palm_completed'
                    r.save()
                except Exception as e:
                    print(f"Failed to update reading {reading_id}: {e}")
            
            return Response(palm_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": f"An error occurred processing the image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

