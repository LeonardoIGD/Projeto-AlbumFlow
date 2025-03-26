from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from gallery.models import Album, Photo
from gallery.api.serializers.album_serializer import AlbumSerializer

class TestAlbumSerializer(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="fotografo", password="senha123")
        self.client.force_authenticate(user=self.user)

        self.album = Album.objects.create(title="Meu Álbum", user=self.user)
        self.album_url = f"/api/gallery/album/{self.album.id}/"

        self.photo = Photo.objects.create(album=self.album, image="test.jpg")
        self.photo_url = f"/api/gallery/photo/{self.photo.id}/"

    def test_get_all_albums(self):
        url = "/api/gallery/album/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)