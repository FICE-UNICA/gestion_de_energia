from rest_framework import viewsets
from ..authentication import CookieTokenAuthentication
from .permissions import IsAdminOrReadOnly
from django.db.models import Q
from ..models import Sistemas_Energeticos
from ..serializers import SistemasEnergeticosSerializer


class SistemasEnergeticosViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = SistemasEnergeticosSerializer

    def get_queryset(self):
        queryset = (
            Sistemas_Energeticos.objects
            .select_related('categoria')
            .prefetch_related('entidades')
            .all()
        )

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(categoria__nombre__icontains=search) |
                Q(entidades__nombre__icontains=search)
            ).distinct()

        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        return queryset.order_by('nombre')