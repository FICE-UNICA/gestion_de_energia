from rest_framework.views import APIView
from rest_framework.response import Response
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from ...models import NAE, Servicio_electrico


MESES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]


class ConsumoPorNAEView(APIView):
    """
    Consumo por mes (año VISUAL) de todas las entidades que tienen un NAE determinado.

    Nota: el consumo mostrado para el mes visual X corresponde a lo
    almacenado en la BD bajo el mes_real = X + 1 (con 12 → 1 del año siguiente).

    URL: /consultas/consumo-por-nae/
    Query:
        - anio (requerido)
        - nae_id (requerido)
        - unidad: kWh | MWh | GWh (default kWh)
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        anio_str = request.query_params.get('anio')
        nae_id = request.query_params.get('nae_id')
        unidad = request.query_params.get('unidad', 'kWh').upper()

        if not anio_str or not nae_id:
            return Response({"error": "Faltan parámetros: anio, nae_id"}, status=400)

        try:
            anio = int(anio_str)
            nae = NAE.objects.get(pk=nae_id)
        except ValueError:
            return Response({"error": "Año inválido"}, status=400)
        except NAE.DoesNotExist:
            return Response({"error": "NAE no encontrado"}, status=404)

        if unidad not in ('KWH', 'MWH', 'GWH'):
            unidad = 'KWH'

        resultado = []
        for mes_visual in range(1, 13):
            # Desplazamiento: mes visual X → mes real X+1
            if mes_visual == 12:
                año_real = anio + 1
                mes_real = 1
            else:
                año_real = anio
                mes_real = mes_visual + 1

            total_kwh = (
                Servicio_electrico.objects
                .filter(entidad__nae=nae, año=año_real, mes=mes_real)
                .aggregate(total=Sum('consumo_real'))['total'] or 0
            )

            if unidad == 'MWH':
                total = total_kwh / 1000.0
            elif unidad == 'GWH':
                total = total_kwh / 1_000_000.0
            else:
                total = total_kwh

            resultado.append({
                'mes': mes_visual,
                # Etiqueta = mes VISUAL (consistente con el patrón)
                'nombre_mes': MESES_ES[mes_visual - 1],
                'total': total,
            })

        return Response({
            'nae': {
                'id': nae.id,
                'codigo': nae.codigo,
                'actividad': nae.actividad,
            },
            'anio': anio,
            'unidad': unidad,
            'resultados': resultado,
        }, status=200)