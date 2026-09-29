from rest_framework import viewsets
from ..authentication import CookieTokenAuthentication
from .permissions import IsAdminOrReadOnly
from django.db.models import Q
from ..models import Categoria_Sistema_Energetico
from ..serializers import CategoriaSistemaEnergeticoSerializer


class CategoriaSistemaEnergeticoViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = CategoriaSistemaEnergeticoSerializer

    def get_queryset(self):
        queryset = Categoria_Sistema_Energetico.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search)
            )
        return queryset.order_by('nombre')