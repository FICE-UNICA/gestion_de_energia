from .base import TimeStampedSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from app_gestion.models import Sistemas_Energeticos, Entidad, Categoria_Sistema_Energetico


class SistemasEnergeticosSerializer(TimeStampedSerializer):
    nombre = serializers.CharField(
        max_length=100,
        validators=[
            UniqueValidator(
                queryset=Sistemas_Energeticos.objects.all(),
                message="Ya existe un sistema energético con este nombre."
            )
        ]
    )

    # FK: acepta el ID
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria_Sistema_Energetico.objects.all()
    )
    # Solo lectura: nombre de la categoría
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    # M2M: acepta lista de IDs
    entidades = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Entidad.objects.all(),
        required=False
    )

    entidades_info = serializers.SerializerMethodField()

    class Meta:
        model = Sistemas_Energeticos
        fields = '__all__'

    def get_entidades_info(self, obj):
        return [
            {'id': e.id, 'nombre': e.nombre or 'Sin nombre', 'codigo_REEUP': e.codigo_REEUP}
            for e in obj.entidades.all()
        ]