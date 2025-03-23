from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from user.views import PhotographerApi, LoginAPI


urlpatterns = [
    path('admin/', admin.site.urls),

    # DRF-Spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Users
    path('photographer/', PhotographerApi.as_view()),
    path('login/', LoginAPI.as_view())
]
