from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'spiritual_goals', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password', 'full_name', 'spiritual_goals')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            spiritual_goals=validated_data.get('spiritual_goals', ''),
            role=validated_data.get('role', 'User')
        )
        return user

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('full_name', 'spiritual_goals')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add custom claims
        data['user'] = UserSerializer(self.user).data
        # Match FastAPI's response format:
        data['access_token'] = data.pop('access')
        data['token_type'] = 'bearer'
        return data

from .models import TarotCard, TarotReading, TarotReadingCard

class TarotCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TarotCard
        fields = '__all__'

class TarotReadingCardSerializer(serializers.ModelSerializer):
    card = TarotCardSerializer(read_only=True)
    class Meta:
        model = TarotReadingCard
        fields = ['id', 'position', 'orientation', 'interpretation', 'card']

class TarotReadingSerializer(serializers.ModelSerializer):
    cards = TarotReadingCardSerializer(many=True, read_only=True)
    class Meta:
        model = TarotReading
        fields = ['id', 'reading_type', 'question', 'created_at', 'overall_interpretation', 'cards']
