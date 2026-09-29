from django.urls import path
from ..views.consultas.consumo_por_mes import ConsumoPorMesView
from ..views.consultas.entidades_mayor_consumo import TopEntidadesConsumoView
from ..views.consultas.generar_pdf import GenerateReportPDFView

from ..views.consultas.consumo_periodo_entidad import ConsumoPeriodoEntidadView
from ..views.consultas.consumo_por_nae import ConsumoPorNAEView
from ..views.consultas.entidades_por_fuente import EntidadesPorFuenteRenovableView
from ..views.consultas.entidades_por_sistema import EntidadesPorSistemaEnergeticoView


urlpatterns = [
   
    path('consultas/consumo-por-mes/', ConsumoPorMesView.as_view(), name='consumo-por-mes'),
    path('consultas/top-entidades/<int:anio>/', TopEntidadesConsumoView.as_view(), name='top_entidades'),
    path('generar-pdf/', GenerateReportPDFView.as_view(), name='generar_pdf'),

    path('consultas/consumo-periodo/<int:pk>/', ConsumoPeriodoEntidadView.as_view()),
    path('consultas/entidades-por-fuente/<int:fuente_id>/', EntidadesPorFuenteRenovableView.as_view()),
    path('consultas/entidades-por-sistema/<int:sistema_id>/', EntidadesPorSistemaEnergeticoView.as_view()),
    path('consultas/consumo-por-nae/', ConsumoPorNAEView.as_view()),
   
]