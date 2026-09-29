from .auth_views import login, logout, perfil_usuario, cambiar_password
from .organismo_views import OrganismoViewSet
from .entidad_views import EntidadViewSet
from .director_views import DirectorViewSet
from .municipio_views import MunicipioViewSet
from .provincia_views import ProvinciaViewSet
from .servicio_electrico_views import ServicioElectricoViewSet
from .user_views import UserViewSet
from .nae_views import NAEViewSet
from .fuentes_renovables_views import FuentesRenovablesViewSet
from .categoria_sistema_energetico_views import CategoriaSistemaEnergeticoViewSet
from .sistemas_energeticos_views import SistemasEnergeticosViewSet
from .consultas.consumo_por_mes import ConsumoPorMesView
from .consultas.entidades_mayor_consumo import TopEntidadesConsumoView

__all__ = [
    'NAEViewSet',
    'login',
    'logout',
    'perfil_usuario',
    'cambiar_password',
    'UserViewSet',
    'OrganismoViewSet',
    'EntidadViewSet',
    'DirectorViewSet',
    'MunicipioViewSet',
    'ProvinciaViewSet',
    'ServicioElectricoViewSet',
    'FuentesRenovablesViewSet',
    'CategoriaSistemaEnergeticoViewSet',
    'SistemasEnergeticosViewSet',
    'ConsumoPorMesView',
    'TopEntidadesConsumoView',
]