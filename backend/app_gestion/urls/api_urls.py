from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views import (
    OrganismoViewSet, EntidadViewSet, DirectorViewSet,
     MunicipioViewSet,
    ProvinciaViewSet, ServicioElectricoViewSet, 
    NAEViewSet, UserViewSet, FuentesRenovablesViewSet, SistemasEnergeticosViewSet
    , CategoriaSistemaEnergeticoViewSet
   
)

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='usuarios')
router.register(r'organismo', OrganismoViewSet, basename='organismo')
router.register(r'entidades', EntidadViewSet, basename='entidades')
router.register(r'directores', DirectorViewSet, basename='directores')
router.register(r'municipios', MunicipioViewSet, basename='municipios')
router.register(r'provincias', ProvinciaViewSet, basename='provincias')
router.register(r'servicios-electricos', ServicioElectricoViewSet, basename='servicios-electricos')
router.register(r'nae', NAEViewSet, basename='nae')
router.register(r'fuentes-renovables', FuentesRenovablesViewSet, basename='fuentes-renovables')
router.register(r'categorias-sistemas-energeticos', CategoriaSistemaEnergeticoViewSet, basename='categorias-sistemas-energeticos')
router.register(r'sistemas-energeticos', SistemasEnergeticosViewSet, basename='sistemas-energeticos')



urlpatterns = [
    path('', include(router.urls)),
]