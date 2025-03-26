import uuid
from django.db import models
from django.contrib.auth.models import User

from gallery.utils import generate_custom_id

class Profile(models.Model):
    """
    Representa o perfil de um usuário no sistema.

    Atributos:
        user (User): Relacionamento um para um com o modelo User, representando o usuário associado ao perfil.
        type_user (str): Tipo do usuário (máximo de 50 caracteres).
        date_created (datetime): Data de criação do perfil.
        date_updated (datetime): Data da última atualização do perfil.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    type_user = models.CharField(max_length=50)
    date_created = models.DateField(auto_now_add=True)
    date_updated = models.DateField(auto_now=True)

    class Meta:
        """
        Configurações de metadados para a classe Profile.
        """
        abstract = True

class Photographer(Profile):
    """
    Representa um fotógrafo no sistema, herdando de Profile.

    Atributos:
        name_photographer (str): Nome do fotógrafo (máximo de 60 caracteres).
        name_company (str): Nome da empresa do fotógrafo (máximo de 50 caracteres).
        phone (str): Número de telefone do fotógrafo (máximo de 20 caracteres).
        s3_folder (str): Diretório no S3 onde as imagens do fotógrafo são armazenadas (padrão gerado automaticamente).
    """
    name_photographer = models.CharField(max_length=60)
    name_company = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    s3_folder = models.CharField(max_length=255, blank=True, editable=False)

    def save(self, *args, **kwargs):
        """
        Sobrescreve o método save para gerar automaticamente o diretório no S3, caso ele não exista.
        O diretório é construído usando um ID personalizado gerado a partir do nome do fotógrafo.

        Args:
            *args: Argumentos posicionais adicionais.
            **kwargs: Argumentos nomeados adicionais.
        """
        if not self.s3_folder:
            self.s3_folder = f"{generate_custom_id(f"{self.name_photographer}")}/"
            
        super().save(*args, **kwargs)

    def __str__(self):
        """
        Retorna uma representação em string do fotógrafo.

        Retorna:
            str: Uma string contendo o tipo de usuário e o nome do fotógrafo.
        """
        return f"{self.type_user} - {self.name_photographer}"

    class Meta:
        """
        Configurações de metadados para o modelo Photographer.
        """
        verbose_name = "Photographer"
        verbose_name_plural = "Photographers"
