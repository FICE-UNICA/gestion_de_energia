from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from ...models import Servicio_electrico


class TopEntidadesConsumoView(APIView):
    """
    Endpoint para las N entidades de mayor consumo en un año VISUAL.
    Parámetros:
        - anio (en URL): año visual.
        - unidad (query): 'kWh', 'MWh' o 'GWh' (por defecto 'kWh').
        - limit (query): entero entre 10 y 100 en pasos de 10 (por defecto 10).
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    LIMITES_VALIDOS = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
    LIMITE_DEFAULT = 10

    def get(self, request, anio):
        try:
            anio = int(anio)
        except (TypeError, ValueError):
            return Response(
                {"error": "El año debe ser un número entero válido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        unidad = request.query_params.get('unidad', 'kWh').upper()
        if unidad not in ('KWH', 'MWH', 'GWH'):
            unidad = 'KWH'

        # Validar `limit`
        limit_raw = request.query_params.get('limit')
        if limit_raw is None:
            limit = self.LIMITE_DEFAULT
        else:
            try:
                limit = int(limit_raw)
            except (TypeError, ValueError):
                limit = self.LIMITE_DEFAULT

            if limit not in self.LIMITES_VALIDOS:
                # Si no es válido, lo redondeamos al múltiplo de 10 más cercano,
                # acotado entre 10 y 100.
                limit = max(10, min(100, round(limit / 10) * 10))

        # Condición: meses reales del período visual:
        # - Meses 2 a 12 del año visual
        # - Mes 1 del año siguiente
        condicion = Q(año=anio, mes__gte=2, mes__lte=12) | Q(año=anio + 1, mes=1)

        resultados = (
            Servicio_electrico.objects
            .filter(condicion)
            .values('entidad__nombre', 'entidad__codigo_REEUP')
            .annotate(consumo_total=Sum('consumo_real'))
            .order_by('-consumo_total')[:limit]
        )

        data = []
        for item in resultados:
            total_kwh = item['consumo_total'] or 0
            if unidad == 'MWH':
                total = total_kwh / 1000.0
            elif unidad == 'GWH':
                total = total_kwh / 1000000.0
            else:
                total = total_kwh
            data.append({
                "nombre": item['entidad__nombre'],
                "codigo_reeup": item['entidad__codigo_REEUP'],
                "consumo_total": total
            })

        return Response(
            {
                "limit": limit,
                "unidad": unidad,
                "resultados": data,
            },
            status=status.HTTP_200_OK
        )