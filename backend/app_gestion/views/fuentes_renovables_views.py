from rest_framework import viewsets
from ..authentication import CookieTokenAuthentication
from .permissions import IsAdminOrReadOnly
from django.db.models import Q
from ..models import Fuentes_Renovables
from ..serializers import FuentesRenovablesSerializer


class FuentesRenovablesViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = FuentesRenovablesSerializer

    def get_queryset(self):
        queryset = Fuentes_Renovables.objects.prefetch_related('entidades').all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search)
            ).distinct()
        return queryset.order_by('nombre')