from django.db import models
from storages.backends.s3boto3 import S3Boto3Storage
import os
from uuid import uuid4
from django.core.files.storage import default_storage
from django.utils.text import slugify

from .album import Album
from gallery.utils import generate_custom_id

class PhotoStorage(S3Boto3Storage):
    """
    Configuração personalizada de armazenamento para fotos utilizando Amazon S3.

    Atributos:
        file_overwrite (bool): Define se arquivos com o mesmo nome podem ser sobrescritos (False).
        default_acl (str): Define o controle de acesso padrão dos arquivos (privado).

    Métodos:
        get_valid_name(name): Normaliza o nome do arquivo, garantindo um caminho correto.
        generate_filename(filename): Normaliza o nome do arquivo gerado, evitando problemas de caminho.
    """
    file_overwrite = False
    default_acl = 'private'
    
    def get_valid_name(self, name):
        """
        Normaliza o nome do arquivo removendo barras invertidas e garantindo um caminho correto.

        Args:
            name (str): Nome original do arquivo.

        Returns:
            str: Nome normalizado do arquivo.
        """
        name = name.replace('\\', '/')
        name = os.path.normpath(name).replace('\\', '/')

        return super().get_valid_name(name)
    
    def generate_filename(self, filename):
        """
        Normaliza o nome do arquivo antes de salvá-lo.

        Args:
            filename (str): Nome original do arquivo.

        Returns:
            str: Nome normalizado do arquivo.
        """
        filename = filename.replace('\\', '/')
        filename = os.path.normpath(filename).replace('\\', '/')

        return super().generate_filename(filename)

class Photo(models.Model):
    """
    Representa uma foto associada a um álbum, armazenada no Amazon S3.

    Atributos:
        album (Album): Referência ao álbum ao qual a foto pertence.
        photo (FileField): Arquivo da foto armazenado no S3.
        s3_path_photo (str): Caminho da foto dentro do S3.

    Propriedades:
        name_photo (str): Retorna o nome do arquivo da foto.
        format_photo (str): Retorna o formato da foto (extensão do arquivo).
        size_photo (int): Retorna o tamanho do arquivo da foto.

    Métodos:
        clean_path(path): Normaliza o caminho da foto removendo barras duplicadas.
        save(*args, **kwargs): Gera o caminho correto para a foto no S3 antes de salvá-la.
    """
    album = models.ForeignKey(
        Album, 
        on_delete=models.CASCADE,
        verbose_name="Photo album"
    )

    photo = models.FileField(
        storage=PhotoStorage(),
        upload_to='',
        max_length=500,
        verbose_name="Photo file"
    )
    
    s3_path_photo = models.CharField(
        max_length=500,
        blank=True, 
        editable=False,
        verbose_name="Photo path S3"
    )

    @property
    def name_photo(self):
        """
        Retorna o nome do arquivo da foto.

        Returns:
            str: Nome do arquivo da foto.
        """
        return self.photo.name
    
    @property
    def format_photo(self):
        """
        Retorna o formato da foto (extensão do arquivo).

        Returns:
            str: Formato da foto em letras maiúsculas (exemplo: JPG, PNG).
        """
        return os.path.splitext(self.photo.name)[1][1:].upper() if self.photo else ''

    @property
    def size_photo(self):
        """
        Retorna o tamanho do arquivo da foto em bytes.

        Returns:
            int: Tamanho do arquivo da foto.
        """
        return self.photo.size if self.photo else 0

    def clean_path(self, path):
        """
        Normaliza o caminho do arquivo removendo barras invertidas e barras duplas.

        Args:
            path (str): Caminho original.

        Returns:
            str: Caminho normalizado.
        """
        path = os.path.normpath(path).replace('\\', '/')

        return path.replace('//', '/')

    def save(self, *args, **kwargs):
        """
        Gera o caminho correto para a foto no S3 antes de salvá-la.

        Se o caminho `s3_path_photo` ainda não foi definido, ele será gerado automaticamente
        baseado no álbum associado.

        Args:
            *args: Argumentos posicionais adicionais.
            **kwargs: Argumentos nomeados adicionais.
        """
        if not self.s3_path_photo and hasattr(self, 'album') and self.album.s3_path_album:
            clean_album_path = self.clean_path(self.album.s3_path_album)
            
            if not clean_album_path.endswith('/'):
                clean_album_path += '/'
            
            ext = os.path.splitext(self.photo.name)[1] if self.photo else '.jpg'
            unique_filename = f"{generate_custom_id(self.name_photo)}{ext}"
            
            self.s3_path_photo = self.clean_path(f"{clean_album_path}{unique_filename}")
            
            if self.photo:
                self.photo.name = self.s3_path_photo
        
        super().save(*args, **kwargs)

    def __str__(self):
        """
        Retorna uma representação em string da foto.

        Returns:
            str: Uma string contendo o ID e o nome da foto.
        """
        return f"{self.id} - {self.name_photo}"

    class Meta:
        """
        Configurações de metadados para o modelo Photo.
        """
        verbose_name = "Photo"
        verbose_name_plural = "Photos"
        ordering = ['id']
