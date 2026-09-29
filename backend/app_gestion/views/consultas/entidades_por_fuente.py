from rest_framework.views import APIView
from rest_framework.response import Response
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ...models import Fuentes_Renovables


class EntidadesPorFuenteRenovableView(APIView):
    """
    Entidades que usan una fuente renovable determinada.
    URL: /consultas/entidades-por-fuente/<fuente_id>/
    Query:
        - municipio_id (opcional): ID del municipio para filtrar.
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, fuente_id):
        try:
            fuente = Fuentes_Renovables.objects.get(pk=fuente_id)
        except Fuentes_Renovables.DoesNotExist:
            return Response({"error": "Fuente renovable no encontrada"}, status=404)

        municipio_id = request.query_params.get('municipio_id')
        entidades_qs = fuente.entidades.select_related('municipio').all()

        if municipio_id:
            try:
                entidades_qs = entidades_qs.filter(municipio_id=int(municipio_id))
            except (TypeError, ValueError):
                return Response({"error": "municipio_id inválido"}, status=400)

        data = [
            {
                'id': e.id,
                'nombre': e.nombre,
                'codigo_REEUP': e.codigo_REEUP,
                'municipio_nombre': e.municipio.nombre if e.municipio else None,
            }
            for e in entidades_qs.order_by('nombre')
        ]

        # Nombre del municipio (para mostrar en la UI/PDF)
        municipio_nombre = ''
        if municipio_id and data:
            municipio_nombre = data[0].get('municipio_nombre') or ''
        elif municipio_id:
            from ...models import Municipio
            try:
                municipio_nombre = Municipio.objects.get(pk=municipio_id).nombre
            except Municipio.DoesNotExist:
                pass

        return Response({
            'fuente': {
                'id': fuente.id,
                'nombre': fuente.nombre,
            },
            'municipio_id': municipio_id or '',
            'municipio': municipio_nombre,
            'total': len(data),
            'resultados': data,
        }, status=200)