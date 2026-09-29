from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from ...models import Entidad, Servicio_electrico


MESES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]


class ConsumoPeriodoEntidadView(APIView):
    """
    Consumo por mes de una entidad en un rango de meses VISUALES de un año VISUAL.

    Nota: el consumo mostrado para el mes visual X corresponde a lo
    almacenado en la BD bajo el mes_real = X + 1 (con 12 → 1 del año siguiente).

    URL: /consultas/consumo-periodo/<pk>/
    Query:
        - anio (requerido)
        - mes_inicial (1..12, requerido)
        - mes_final   (1..12, requerido, >= mes_inicial)
        - unidad: kWh | MWh | GWh (default kWh)
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            entidad = Entidad.objects.get(pk=pk)
        except Entidad.DoesNotExist:
            return Response({"error": "Entidad no encontrada"}, status=404)

        anio_str = request.query_params.get('anio')
        mes_ini_str = request.query_params.get('mes_inicial')
        mes_fin_str = request.query_params.get('mes_final')
        unidad = request.query_params.get('unidad', 'kWh').upper()

        if not all([anio_str, mes_ini_str, mes_fin_str]):
            return Response(
                {"error": "Faltan parámetros: anio, mes_inicial, mes_final"},
                status=400
            )

        try:
            anio = int(anio_str)
            mes_inicial = int(mes_ini_str)
            mes_final = int(mes_fin_str)
        except ValueError:
            return Response({"error": "Parámetros numéricos inválidos"}, status=400)

        if not (1 <= mes_inicial <= 12 and 1 <= mes_final <= 12):
            return Response({"error": "Los meses deben estar entre 1 y 12"}, status=400)
        if mes_inicial > mes_final:
            return Response({"error": "mes_inicial debe ser <= mes_final"}, status=400)

        if unidad not in ('KWH', 'MWH', 'GWH'):
            unidad = 'KWH'

        resultado = []
        total_periodo = 0.0

        # range() excluye el extremo superior, +1 para incluir mes_final
        for mes_visual in range(mes_inicial, mes_final + 1):
            # Desplazamiento: mes visual X → mes real X+1
            if mes_visual == 12:
                año_real = anio + 1
                mes_real = 1
            else:
                año_real = anio
                mes_real = mes_visual + 1

            total_kwh = (
                Servicio_electrico.objects
                .filter(entidad=entidad, año=año_real, mes=mes_real)
                .aggregate(total=Sum('consumo_real'))['total'] or 0
            )

            if unidad == 'MWH':
                total = total_kwh / 1000.0
            elif unidad == 'GWH':
                total = total_kwh / 1_000_000.0
            else:
                total = total_kwh

            total_periodo += total
            resultado.append({
                'mes': mes_visual,
                # Etiqueta = mes VISUAL (consistente con el patrón)
                'nombre_mes': MESES_ES[mes_visual - 1],
                'total': total,
            })

        return Response({
            'entidad': {
                'id': entidad.id,
                'nombre': entidad.nombre,
                'codigo_REEUP': entidad.codigo_REEUP,
            },
            'anio': anio,
            'mes_inicial': mes_inicial,
            'mes_final': mes_final,
            'unidad': unidad,
            'resultados': resultado,
            'total_periodo': total_periodo,
        }, status=200)