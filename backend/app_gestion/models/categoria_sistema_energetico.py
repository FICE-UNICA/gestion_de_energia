from .base import TimeStampedModel
from django.db import models


class Categoria_Sistema_Energetico(TimeStampedModel):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre")
  
    class Meta:
        verbose_name = "Categoría de sistema energético"
        verbose_name_plural = "Categorías de sistemas energéticos"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre