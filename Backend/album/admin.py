from django.contrib import admin

from album.models import Album


class AlbumAdmin(admin.ModelAdmin):
    model = Album

    list_display = ('id_album', 'name_album', 'photographer', 'created_at')

    search_fields = ('description', 'month')
    ordering = ('id_album')

admin.site.register(Album, AlbumAdmin)