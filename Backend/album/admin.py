from django.contrib import admin

from album.models import Album, Tag


class AlbumAdmin(admin.ModelAdmin):
    model = Album

    list_display = ('id', 'name_album', 'photographer', 'created_at_album')

    search_fields = ('name_album',)
    ordering = ('id',)

admin.site.register(Album, AlbumAdmin)

class TagAdmin(admin.ModelAdmin):
    model = Tag

    list_display = ('id', 'name_tag', 'photographer')

    search_fields = ('name_tag',)
    ordering = ('id', 'name_tag')

admin.site.register(Tag, TagAdmin)