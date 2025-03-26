from django.db import models

from user.models import Photographer


class Tag(models.Model):
    """
    Representa uma tag associada a um fotógrafo.

    Atributos:
        name_tag (str): Nome da tag (máximo de 20 caracteres).
        photographer (Photographer): Fotógrafo ao qual a tag está associada.
    """
    name_tag = models.CharField(
        max_length=20,
        verbose_name="Tag name"
    )

    photographer = models.ForeignKey(
        Photographer, 
        on_delete=models.CASCADE, 
        verbose_name="Photographer"
    )

    def __str__(self):
        """
        Retorna uma representação em string da tag.

        Retorna:
            str: Uma string contendo o ID e o nome da tag.
        """
        return f"{self.id} - {self.name_tag}"
    
    class Meta:
        """
        Configurações de metadados para o modelo Tag.
        """
        verbose_name = "Tag",
        verbose_name_plural = "Tags"
        ordering = ['id', 'name_tag']
