from django.urls import path, include
from rest_framework import routers

from gallery.api import (
    AlbumViewSet,
    PhotoViewSet,
    PhotoByAlbumViewSet
)

router = routers.DefaultRouter()

router.register(r'album', AlbumViewSet, basename='album-api')
router.register(r'photo', PhotoViewSet, basename='photo-api')

urlpatterns = [
    path('', include(router.urls), name="gallery"),

    path(
        'album/<int:id>/photos/', 
        PhotoByAlbumViewSet.as_view({'get': 'list'}), 
        name='photo-by-album'
    ),
]

