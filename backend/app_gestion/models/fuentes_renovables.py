from .base import TimeStampedModel
from django.db import models


class Fuentes_Renovables(TimeStampedModel):

    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre"
    )
  
    # Relación M2M: una entidad puede usar 0..N fuentes renovables
    #                 una fuente renovable puede ser usada por 0..N entidades
    entidades = models.ManyToManyField(
        'app_gestion.Entidad',
        related_name='fuentes_renovables',
        blank=True,
        verbose_name="Entidades"
    )

    class Meta:
        verbose_name = "Fuente renovable"
        verbose_name_plural = "Fuentes renovables"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"