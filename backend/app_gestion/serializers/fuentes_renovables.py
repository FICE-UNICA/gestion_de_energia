from .base import TimeStampedSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from app_gestion.models import Fuentes_Renovables, Entidad


class FuentesRenovablesSerializer(TimeStampedSerializer):
    nombre = serializers.CharField(
        max_length=100,
        validators=[
            UniqueValidator(
                queryset=Fuentes_Renovables.objects.all(),
                message="Ya existe una fuente renovable con este nombre."
            )
        ]
    )

    # M2M: IDs de entidades (escritura)
    entidades = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Entidad.objects.all(),
        required=False
    )

    # Solo lectura: info resumida de entidades asociadas
    entidades_info = serializers.SerializerMethodField()

    class Meta:
        model = Fuentes_Renovables
        fields = '__all__'

    def get_entidades_info(self, obj):
        return [
            {'id': e.id, 'nombre': e.nombre or 'Sin nombre', 'codigo_REEUP': e.codigo_REEUP}
            for e in obj.entidades.all()
        ]