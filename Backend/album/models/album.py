import uuid
from django.db import models
from datetime import datetime

class Album(models.Model):
    id_album = models.AutoField(
        primary_key=True,
        verbose_name="Identificar do álbum"
    )

    uuid_album = models.UUIDField(
        default=uuid.uuid4,
        editable=False
    );

    name_album = models.CharField(
        max_length=50,
        verbose_name="Nome do álbum"
    )

    photographer = models.ForeignKey(
        ...,
        on_delete=models.CASCADE,
        verbose_name="Fotógrafo"
    )

    tags = models.ManyToManyField(
        ...,
        verbose_name="Lista de tags"
    )

    link = models.URLField(
        verbose_name="Link do álbum"
    )

    created_at = models.DateTimeField(
        default=datetime.now(),
        verbose_name="Data de criação"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Data de atualização"
    )

    def __str__(self):
        return f"{self.id_album} - {self.nome_album}"
    
    class Meta:
        verbose_name = "Álbum",
        verbose_name_plural = "Álbuns"
        ordering = ['id_album', 'name_album']
