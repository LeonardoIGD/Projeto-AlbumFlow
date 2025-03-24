from django.db import models

from .album import Album

class Photo(models.Model):
    album = models.ForeignKey(
        Album, 
        on_delete=models.CASCADE,
        verbose_name="Photo album"
    )

    name_photo = models.CharField(
        max_length=60,
        verbose_name="Photo name"
    )

    url_photo = models.URLField(
        verbose_name="Photo url"
    )

    format_photo = models.CharField(
        max_length=10,
        verbose_name="Photo format"
    )

    size_photo = models.IntegerField(
        verbose_name="Photo size"
    )

    def __str__(self):
        return f"{self.id} - {self.name_photo}"
    
    class Meta:
        verbose_name = "Photo",
        verbose_name_plural = "Photos"
        ordering = ['id', 'name_photo']
