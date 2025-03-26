from rest_framework import serializers

from user.models import Photographer


class PhotographerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Photographer
        fields = ['user', 'type_user', 'username', 'email', 'phone', 'name_photographer', 'name_company']
        read_only_fields = ['id', 'username', 'email']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
