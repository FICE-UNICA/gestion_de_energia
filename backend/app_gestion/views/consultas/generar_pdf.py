# views/consultas/generate_pdf.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
from datetime import datetime
from ...authentication import CookieTokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q, Count
from ...models import (
    Servicio_electrico,
    Entidad,
    Fuentes_Renovables,
    Sistemas_Energeticos,
    NAE,
    Municipio,
)


class GenerateReportPDFView(APIView):
    """
    Endpoint para generar un reporte PDF de la consulta seleccionada.
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    # Mapa de unidades: código interno → texto de presentación
    UNIDAD_DISPLAY = {
        'KWH': 'kWh',
        'MWH': 'MWh',
        'GWH': 'GWh',
    }

    # Opciones válidas para el Top N
    LIMITES_VALIDOS = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
    LIMITE_DEFAULT = 10

    def _normalizar_limit(self, raw):
        """Valida y normaliza el valor de `limit` al múltiplo de 10 más cercano."""
        if raw is None:
            return self.LIMITE_DEFAULT
        try:
            valor = int(raw)
        except (TypeError, ValueError):
            return self.LIMITE_DEFAULT
        if valor in self.LIMITES_VALIDOS:
            return valor
        return max(10, min(100, round(valor / 10) * 10))

    def get(self, request):
        consulta = request.query_params.get('consulta')
        anio_str = request.query_params.get('anio')
        entidad_id = request.query_params.get('entidadId')
        unidad = request.query_params.get('unidad', 'kWh').upper()

        # Nuevos parámetros
        mes_inicial_str = request.query_params.get('mesInicial')
        mes_final_str = request.query_params.get('mesFinal')
        fuente_id = request.query_params.get('fuenteId')
        sistema_id = request.query_params.get('sistemaId')
        nae_id = request.query_params.get('naeId')
        municipio_id = request.query_params.get('municipioId')

        if not consulta:
            return Response({"error": "Falta el parámetro 'consulta'"}, status=400)

        # Validaciones por tipo de consulta
        if consulta in ['consumo', 'servicios', 'info', 'consumo_periodo'] and not entidad_id:
            return Response({"error": "Esta consulta requiere entidadId"}, status=400)

        if consulta in ['consumo', 'consumo_global', 'top_consumo', 'consumo_periodo'] and not anio_str:
            return Response({"error": "Esta consulta requiere año"}, status=400)

        if consulta == 'consumo_periodo' and (not mes_inicial_str or not mes_final_str):
            return Response({"error": "Esta consulta requiere mesInicial y mesFinal"}, status=400)

        if consulta == 'entidades_por_fuente' and not fuente_id:
            return Response({"error": "Esta consulta requiere fuenteId"}, status=400)

        if consulta == 'entidades_por_sistema' and not sistema_id:
            return Response({"error": "Esta consulta requiere sistemaId"}, status=400)

        if consulta == 'consumo_por_nae' and (not nae_id or not anio_str):
            return Response({"error": "Esta consulta requiere naeId y año"}, status=400)

        anio = int(anio_str) if anio_str else None

        # Normalizar el código interno de la unidad
        if unidad not in ('KWH', 'MWH', 'GWH'):
            unidad = 'KWH'

        unidad_display = self.UNIDAD_DISPLAY[unidad]
        limit = self._normalizar_limit(request.query_params.get('limit'))

        meses_nombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]

        context = {
            'consulta': consulta,
            'anio': anio,
            'unidad': unidad,
            'unidad_display': unidad_display,
            'top_limit': limit,
            'fecha_generacion': datetime.now().strftime('%d/%m/%Y %H:%M:%S'),
        }

        if mes_inicial_str and mes_final_str:
            context['mes_inicial'] = mes_inicial_str
            context['mes_final'] = mes_final_str

        # Nombre de municipio para mostrar en el PDF (solo si se filtra por él)
        if municipio_id:
            try:
                municipio_obj = Municipio.objects.get(pk=int(municipio_id))
                context['municipio'] = municipio_obj.nombre
            except (Municipio.DoesNotExist, ValueError, TypeError):
                pass

        try:
            # ============ CONSULTAS EXISTENTES ============
            if consulta == 'info' and entidad_id:
                entidad = Entidad.objects.get(pk=entidad_id)
                campos = [
                    ('Nombre', entidad.nombre),
                    ('Código REEUP', entidad.codigo_REEUP),
                    ('Municipio', entidad.municipio.nombre if entidad.municipio else None),
                    ('NAE', f"{entidad.nae.codigo} - {entidad.nae.actividad}" if entidad.nae else None),
                    ('Siglas', entidad.siglas),
                    ('Cuenta bancaria', entidad.cuenta_bancaria),
                    ('Teléfono', entidad.telefono),
                    ('NIT', entidad.NIT),
                    ('Dirección', entidad.direccion),
                    ('Geolocalización', entidad.geolocalizacion),
                ]
                context['datos'] = [{'label': lbl, 'value': val} for lbl, val in campos if val]

            elif consulta == 'servicios' and entidad_id:
                entidad = Entidad.objects.get(pk=entidad_id)
                context['entidad_nombre'] = entidad.nombre
                context['codigo_reeup'] = entidad.codigo_REEUP
                servicios_qs = (
                    Servicio_electrico.objects
                    .filter(entidad_id=entidad_id)
                    .values('codigo_servicio', 'mes', 'año', 'consumo_real')
                    .order_by('año', 'mes')
                )
                servicios = []
                for s in servicios_qs:
                    mes_orig = s['mes']
                    año_orig = s['año']
                    if mes_orig == 1:
                        mes_display = 12
                        año_display = año_orig - 1
                    else:
                        mes_display = mes_orig - 1
                        año_display = año_orig

                    s['mes_display'] = mes_display
                    s['año_display'] = año_display
                    servicios.append(s)
                context['servicios'] = servicios

            elif consulta == 'consumo' and entidad_id and anio:
                entidad = Entidad.objects.get(pk=entidad_id)
                context['entidad_nombre'] = entidad.nombre
                context['codigo_reeup'] = entidad.codigo_REEUP

                resultado_mensual = []
                for mes_visual in range(1, 13):
                    if mes_visual == 12:
                        año_real = anio + 1
                        mes_real = 1
                    else:
                        año_real = anio
                        mes_real = mes_visual + 1

                    total_kwh = Servicio_electrico.objects.filter(
                        entidad=entidad, año=año_real, mes=mes_real
                    ).aggregate(total=Sum('consumo_real'))['total'] or 0

                    if unidad == 'MWH':
                        total = total_kwh / 1000.0
                    elif unidad == 'GWH':
                        total = total_kwh / 1_000_000.0
                    else:
                        total = total_kwh

                    resultado_mensual.append({
                        'mes': mes_visual,
                        'nombre_mes': meses_nombres[mes_visual - 1],
                        'total': total
                    })

                max_total = max((item['total'] for item in resultado_mensual), default=0)
                for item in resultado_mensual:
                    item['ancho'] = (item['total'] / max_total * 100) if max_total > 0 else 0

                context['consumo_mensual'] = resultado_mensual

            elif consulta == 'consumo_global' and anio:
                resultado_mensual = []
                for mes_visual in range(1, 13):
                    if mes_visual == 12:
                        año_real = anio + 1
                        mes_real = 1
                    else:
                        año_real = anio
                        mes_real = mes_visual + 1

                    total_kwh = Servicio_electrico.objects.filter(
                        año=año_real, mes=mes_real
                    ).aggregate(total=Sum('consumo_real'))['total'] or 0

                    if unidad == 'MWH':
                        total = total_kwh / 1000.0
                    elif unidad == 'GWH':
                        total = total_kwh / 1_000_000.0
                    else:
                        total = total_kwh

                    resultado_mensual.append({
                        'mes': mes_visual,
                        'nombre_mes': meses_nombres[mes_visual - 1],
                        'total': total
                    })

                max_total = max((item['total'] for item in resultado_mensual), default=0)
                for item in resultado_mensual:
                    item['ancho'] = (item['total'] / max_total * 100) if max_total > 0 else 0

                context['consumo_mensual'] = resultado_mensual

            elif consulta == 'top_consumo' and anio:
                condicion = Q(año=anio, mes__gte=2, mes__lte=12) | Q(año=anio + 1, mes=1)
                resultados = (
                    Servicio_electrico.objects
                    .filter(condicion)
                    .values('entidad__nombre', 'entidad__codigo_REEUP')
                    .annotate(consumo_total=Sum('consumo_real'))
                    .order_by('-consumo_total')[:limit]
                )
                top = []
                for item in resultados:
                    total_kwh = item['consumo_total'] or 0
                    if unidad == 'MWH':
                        total = total_kwh / 1000.0
                    elif unidad == 'GWH':
                        total = total_kwh / 1_000_000.0
                    else:
                        total = total_kwh
                    top.append({
                        'nombre': item['entidad__nombre'],
                        'codigo_reeup': item['entidad__codigo_REEUP'],
                        'consumo_total': total
                    })
                context['top_entidades'] = top

            elif consulta == 'sin_servicio':
                entidades = Entidad.objects.annotate(
                    num_servicios=Count('servicios_electricos')
                ).filter(num_servicios=0)
                context['listado'] = entidades.values('nombre', 'codigo_REEUP', 'municipio__nombre')

            elif consulta == 'sin_nombre':
                entidades = Entidad.objects.filter(Q(nombre__isnull=True) | Q(nombre=''))
                context['listado'] = entidades.values('nombre', 'codigo_REEUP', 'municipio__nombre')

            # ============ CONSULTAS NUEVAS ============

            elif consulta == 'consumo_periodo' and entidad_id and anio:
                try:
                    mes_inicial = int(mes_inicial_str)
                    mes_final = int(mes_final_str)
                except ValueError:
                    return Response({"error": "mesInicial/mesFinal inválidos"}, status=400)

                if not (1 <= mes_inicial <= 12 and 1 <= mes_final <= 12):
                    return Response({"error": "Los meses deben estar entre 1 y 12"}, status=400)
                if mes_inicial > mes_final:
                    return Response({"error": "mesInicial debe ser <= mesFinal"}, status=400)

                entidad = Entidad.objects.get(pk=entidad_id)
                context['entidad_nombre'] = entidad.nombre
                context['codigo_reeup'] = entidad.codigo_REEUP

                periodo = []
                for mes_visual in range(mes_inicial, mes_final + 1):
                    if mes_visual == 12:
                        año_real = anio + 1
                        mes_real = 1
                    else:
                        año_real = anio
                        mes_real = mes_visual + 1

                    total_kwh = Servicio_electrico.objects.filter(
                        entidad=entidad, año=año_real, mes=mes_real
                    ).aggregate(total=Sum('consumo_real'))['total'] or 0

                    if unidad == 'MWH':
                        total = total_kwh / 1000.0
                    elif unidad == 'GWH':
                        total = total_kwh / 1_000_000.0
                    else:
                        total = total_kwh

                    periodo.append({
                        'nombre_mes': meses_nombres[mes_visual - 1],
                        'total': total,
                    })

                context['periodo_mensual'] = periodo

            elif consulta == 'entidades_por_fuente' and fuente_id:
                try:
                    fuente = Fuentes_Renovables.objects.get(pk=fuente_id)
                except Fuentes_Renovables.DoesNotExist:
                    return Response({"error": "Fuente renovable no encontrada"}, status=404)

                qs = fuente.entidades.select_related('municipio').all()
                # Filtrado por ID de municipio (más robusto que por nombre)
                if municipio_id:
                    try:
                        qs = qs.filter(municipio_id=int(municipio_id))
                    except (ValueError, TypeError):
                        pass

                context['titulo_listado'] = f"Entidades que usan la fuente renovable: {fuente.nombre}"
                context['listado'] = list(
                    qs.order_by('nombre').values('nombre', 'codigo_REEUP', 'municipio__nombre')
                )

            elif consulta == 'entidades_por_sistema' and sistema_id:
                try:
                    sistema = (
                        Sistemas_Energeticos.objects
                        .select_related('categoria')
                        .get(pk=sistema_id)
                    )
                except Sistemas_Energeticos.DoesNotExist:
                    return Response({"error": "Sistema energético no encontrado"}, status=404)

                qs = sistema.entidades.select_related('municipio').all()
                # Filtrado por ID de municipio (más robusto que por nombre)
                if municipio_id:
                    try:
                        qs = qs.filter(municipio_id=int(municipio_id))
                    except (ValueError, TypeError):
                        pass

                cat = sistema.categoria.nombre if sistema.categoria else 'Sin categoría'
                context['titulo_listado'] = (
                    f"Entidades que usan el sistema energético: {sistema.nombre} ({cat})"
                )
                context['listado'] = list(
                    qs.order_by('nombre').values('nombre', 'codigo_REEUP', 'municipio__nombre')
                )

            elif consulta == 'consumo_por_nae' and nae_id and anio:
                try:
                    nae = NAE.objects.get(pk=nae_id)
                except NAE.DoesNotExist:
                    return Response({"error": "NAE no encontrado"}, status=404)

                context['nae_info'] = {
                    'codigo': nae.codigo,
                    'actividad': nae.actividad,
                }

                nae_mensual = []
                for mes_visual in range(1, 13):
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

                    nae_mensual.append({
                        'nombre_mes': meses_nombres[mes_visual - 1],
                        'total': total,
                    })

                context['consumo_nae_mensual'] = nae_mensual

            else:
                return Response({"error": "Tipo de consulta no soportado"}, status=400)

        except Exception as e:
            return Response({"error": f"Error al obtener datos: {str(e)}"}, status=500)

        html_string = render_to_string('reporte_pdf.html', context)

        try:
            pdf_file = HTML(string=html_string).write_pdf()
        except Exception as e:
            return Response({"error": f"Error al generar PDF: {str(e)}"}, status=500)

        response = HttpResponse(pdf_file, content_type='application/pdf')
        filename = f"reporte_{consulta}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response