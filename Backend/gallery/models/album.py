from django.db import models

from user.models import Photographer, Tag
from gallery.utils import generate_custom_id


class Album(models.Model):
    """
    Representa um álbum de fotos associado a um fotógrafo.

    Atributos:
        name_album (str): Nome do álbum (máximo de 50 caracteres).
        photographer (Photographer): Fotógrafo proprietário do álbum.
        tags (ManyToManyField): Lista de tags associadas ao álbum (opcional).
        s3_path_album (str): Caminho onde o álbum está armazenado no AWS S3.
        created_at_album (datetime): Data e hora da criação do álbum.
        updated_at_album (datetime): Data e hora da última atualização do álbum.
    """
    name_album = models.CharField(
        max_length=50,
        verbose_name="Album name"
    )

    photographer = models.ForeignKey(
        Photographer,
        on_delete=models.CASCADE,
        verbose_name="Photographer"
    )

    tags = models.ManyToManyField(
        Tag,
        verbose_name="Album tag list",
        null=True,
        blank=True
    )

    s3_path_album = models.CharField(
        max_length=255, 
        blank=True, 
        editable=False,
        verbose_name="Album path S3"
    )

    created_at_album = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Album creation date"
    )

    updated_at_album = models.DateTimeField(
        auto_now=True,
        verbose_name="Album update date"
    )

    def __str__(self):
        """
        Retorna uma representação em string do álbum.

        Retorna:
            str: Uma string contendo o ID e o nome do álbum.
        """
        return f"{self.id} - {self.name_album}"
    
    def save(self, *args, **kwargs):
        """
        Sobrescreve o método save para gerar o caminho no S3 para o álbum, caso ele não exista.
        O caminho é construído usando a pasta do fotógrafo no S3 e um ID personalizado gerado.

        Args:
            *args: Argumentos posicionais adicionais.
            **kwargs: Argumentos nomeados adicionais.
        """
        if not self.s3_path_album:
            self.s3_path_album = f"{self.photographer.s3_folder}albums/{generate_custom_id(self.name_album)}/"
        
        super().save(*args, **kwargs)

    class Meta:
        """
        Configurações de metadados para o modelo Album.
        """
        verbose_name = "Album",
        verbose_name_plural = "Albuns"
        ordering = ['id', 'name_album']
