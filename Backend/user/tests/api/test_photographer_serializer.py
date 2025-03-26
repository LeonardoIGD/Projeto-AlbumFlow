from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from user.models import Photographer
from user.api.serializers.photographer_serializer import PhotographerSerializer


class TestPhotographerSerializer(APITestCase):
    def setUp(self) -> None:
        self.user = User.objects.create_user(username="felipe", password="senha")
        self.photographer = Photographer.objects.create(
            user=self.user,
            type_user="fotografo",
            name_photographer="Hidequel",
            name_company="fotos massa",
        )

        self.expected_data = {
            "user": self.user.id,
            "type_user": "fotografo",
            "name_photographer": "Hidequel",
            "name_company": "fotos massa",
        }

    def test_photographer_serializer_valid_data(self):
        serializer = PhotographerSerializer(instance=self.photographer)
        self.assertEqual(self.expected_data, serializer.data)

    def test_photographer_get_via_api(self):
        url = f"/api/users/{self.user.id}/" 
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name_photographer"], "Hidequel")
        self.assertEqual(response.data["name_company"], "fotos massa")

    def test_photographer_all_get_via_api(self):
        url = "/api/users/"  
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_photographer_creation_invalid_data(self):
        invalid_data = self.expected_data.copy()
        del invalid_data["name_photographer"] 
        url = "/api/users/" 
        response = self.client.post(url, invalid_data, format="json")
        # print(response.status_code, response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name_photographer", response.data)

    def test_edit_user_information(self):
        """Testa a edição de informações do usuário"""
        url = f"/api/users/{self.user.id}/" 
        new_data = {
            "user": self.user.id,
            "type_user": "cliente",
            "name_photographer": "felipe",
            "name_company": "fotos n massas",
        }

        response = self.client.put(url, new_data, format="json")  

        print(response.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.photographer.refresh_from_db() 
        self.assertEqual(self.photographer.type_user, new_data["type_user"])
        self.assertEqual(self.photographer.name_photographer, new_data["name_photographer"])
        self.assertEqual(self.photographer.name_company, new_data["name_company"])

    def test_patch_user_information(self):
        url = f"/api/users/{self.user.id}/" 
        partial_data = {
            "name_photographer": "Felipe Hidequel"
        }

        response = self.client.patch(url, partial_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.photographer.refresh_from_db() 
        self.assertEqual(self.photographer.type_user, "fotografo")
        self.assertEqual(self.photographer.name_photographer, "Felipe Hidequel")
        self.assertEqual(self.photographer.name_company, "fotos massa")