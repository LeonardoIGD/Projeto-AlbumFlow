from django.contrib import admin

from .models.profile import Photographer
class PhotographerAdmin(admin.ModelAdmin):
    model = Photographer

    list_display = ('id', 'name_photographer', 'name_company', 'phone')

    search_fields = ('name_photographer', 'name_company')
    ordering = ('name_photographer',)

admin.site.register(Photographer, PhotographerAdmin)