from rest_framework import serializers
from album.models import Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name_tag', 'photographer']
        read_only_fields = ['id']