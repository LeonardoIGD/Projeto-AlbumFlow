from rest_framework import serializers
from gallery.models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'album', 'name_photo', 'url_photo', 'format_photo', 'size_photo',
        ]
        read_only_fields = ('id',)

    def validate_size_photo(self, value):
        if value <= 0:
            raise serializers.ValidationError("O tamanho da foto deve ser maior que zero")
        
        return value

    def validate_format_photo(self, value):
        valid_formats = ['JPEG', 'JPG', 'PNG', 'GIF', 'WEBP']
        if value.upper() not in valid_formats:
            raise serializers.ValidationError(f"Formato inválido. Use um dos seguintes: {', '.join(valid_formats)}")
        
        return value.upper()