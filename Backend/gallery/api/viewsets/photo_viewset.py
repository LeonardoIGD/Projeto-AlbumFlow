from rest_framework import viewsets, permissions
from gallery.models import Photo
from ..serializers.photo_serializer import PhotoSerializer


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
