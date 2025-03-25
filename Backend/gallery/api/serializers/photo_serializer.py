import uuid, os
from rest_framework import serializers
from gallery.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    format_photo = serializers.SerializerMethodField()
    size_photo = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ['id', 'album', 'name_photo', 'photo', 's3_path_photo', 'format_photo', 'size_photo']
        read_only_fields = ['name_photo', 's3_path_photo', 'format_photo', 'size_photo']
        extra_kwargs = {
            'photo': {'write_only': True}
        }

    def get_format_photo(self, obj):
        return obj.format_photo

    def get_size_photo(self, obj):
        return obj.size_photo

    def validate_photo(self, value):
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        ext = os.path.splitext(value.name)[1].lower()

        if ext not in valid_extensions:
            raise serializers.ValidationError("Formato de arquivo não suportado")
        
        return value