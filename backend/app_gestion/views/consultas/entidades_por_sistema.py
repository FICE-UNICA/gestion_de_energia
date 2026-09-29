from rest_framework.views import APIView
from rest_framework.response import Response
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ...models import Sistemas_Energeticos


class EntidadesPorSistemaEnergeticoView(APIView):
    """
    Entidades que usan un sistema energético determinado.
    URL: /consultas/entidades-por-sistema/<sistema_id>/
    Query:
        - municipio_id (opcional): ID del municipio para filtrar.
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, sistema_id):
        try:
            sistema = (
                Sistemas_Energeticos.objects
                .select_related('categoria')
                .get(pk=sistema_id)
            )
        except Sistemas_Energeticos.DoesNotExist:
            return Response({"error": "Sistema energético no encontrado"}, status=404)

        municipio_id = request.query_params.get('municipio_id')
        entidades_qs = sistema.entidades.select_related('municipio').all()

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
            'sistema': {
                'id': sistema.id,
                'nombre': sistema.nombre,
                'categoria': sistema.categoria.nombre if sistema.categoria else None,
            },
            'municipio_id': municipio_id or '',
            'municipio': municipio_nombre,
            'total': len(data),
            'resultados': data,
        }, status=200)