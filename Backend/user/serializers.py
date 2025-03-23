from rest_framework import serializers
from .models.profile import Photographer

class PhotographerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()