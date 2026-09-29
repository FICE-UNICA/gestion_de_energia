from .base import TimeStampedSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from app_gestion.models import Categoria_Sistema_Energetico


class CategoriaSistemaEnergeticoSerializer(TimeStampedSerializer):
    nombre = serializers.CharField(
        max_length=100,
        validators=[
            UniqueValidator(
                queryset=Categoria_Sistema_Energetico.objects.all(),
                message="Ya existe una categoría con este nombre."
            )
        ]
    )

    # Cuántos sistemas tiene esta categoría (útil para el index)
    total_sistemas = serializers.SerializerMethodField()

    class Meta:
        model = Categoria_Sistema_Energetico
        fields = '__all__'

    def get_total_sistemas(self, obj):
        return obj.sistemas_energeticos.count()