from .base import TimeStampedModel
from django.db import models


class Sistemas_Energeticos(TimeStampedModel):
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nombre del sistema"
    )

    # FK: una categoría puede tener muchos sistemas
    categoria = models.ForeignKey(
        'app_gestion.Categoria_Sistema_Energetico',
        on_delete=models.PROTECT,
        related_name='sistemas_energeticos',
        verbose_name="Categoría",
     
    )

    # M2M: un sistema puede estar en varias entidades
    entidades = models.ManyToManyField(
        'app_gestion.Entidad',
        related_name='sistemas_energeticos',
        blank=True,
        verbose_name="Entidades"
    )

    class Meta:
        verbose_name = "Sistema energético"
        verbose_name_plural = "Sistemas energéticos"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.categoria.nombre})"