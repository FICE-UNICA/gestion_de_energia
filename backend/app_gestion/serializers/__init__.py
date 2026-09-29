from .user import UserSerializer
from .organismo import OrganismoSerializer
from .entidad import EntidadSerializer
from .director import DirectorSerializer
from .municipio import MunicipioSerializer
from .provincia import ProvinciaSerializer
from .servicio_electrico import ServicioElectricoSerializer
from .nae import NAESerializer
from .fuentes_renovables import FuentesRenovablesSerializer
from .categoria_sistema_energetico import CategoriaSistemaEnergeticoSerializer
from .sistemas_energeticos import SistemasEnergeticosSerializer


__all__ = [
    'NAESerializer',
    'UserSerializer',
    'OrganismoSerializer',
    'EntidadSerializer',
    'DirectorSerializer',
    'MunicipioSerializer',
    'ProvinciaSerializer',
    'ServicioElectricoSerializer',
    'FuentesRenovablesSerializer',
    'CategoriaSistemaEnergeticoSerializer',
    'SistemasEnergeticosSerializer',
]