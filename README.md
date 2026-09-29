# ⚡ Sistema de Gestión Energética

Aplicación web para la gestión de la información relacionada con el uso racional de la energía eléctrica en la provincia Ciego de Ávila. Desarrollada con Django REST Framework y React, facilita la administración de entidades y servicios eléctricos.

## 🚀 Características principales

- Autenticación de usuarios con tokens. 
- Gestión completa de entidades, organismos, servicios eléctricos, provincias y municipios.
- Generación de reportes y gráficos de consumo.
- Diseño responsive con Tailwind CSS.


## 🛠️ Tecnologías utilizadas

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/Django_REST-ff1709?style=for-the-badge&logo=django&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Base de Datos
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)


### Despliegue
- Render (backend y frontend)
- Supabase (base de datos)


### 📁 Estructura del proyecto (backend)

```
app_gestion/
├── models/               # Modelos organizados por archivo
│   ├── base.py           # TimeStampedModel abstracto
│   ├── organismo.py, entidad.py, municipio.py, servicio_electrico.py, ...
├── serializers/          # Serializadores DRF
├── views/                # ViewSets y vistas de autenticación
├── urls/                 # Configuración de rutas (auth, api, consultas)
└── admin.py              # Registro en el administrador de Django
```


### 🖼️ Imágenes de la aplicación

**Login**

<img src="img/login.png" alt="Formulario de login">

<br>

**Inicio**

<img src="img/inicio.png" alt="Vista de inicio">

<br>

**Perfil de usuario**

<img src="img/perfil.png" alt="Perfil de usuario">

<br>

**Sidebar**

<img src="img/sidebar.png" alt="Sidebar">

<br>

**Gestionar entidades**

<img src="img/crud_entidad/gestionar_entidades.png" alt="Vista de gestión de entidades">

<br>

**Crear entidad**

<img src="img/crud_entidad/crear_entidad.png" alt="Vista de crear entidad">

<br>

**Editar entidad**

<img src="img/crud_entidad/editar_entidad.png" alt="Vista de editar entidad">

<br>

**Eliminar entidad**

<img src="img/crud_entidad/eliminar_entidad.png" alt="Vista de eliminar entidad">

<br>

**Gestionar servicios eléctricos**

<img src="img/gestionar_servicios_electricos.png" alt="Vista de gestión de servicios eléctricos">

<br>

**Importar archivo Excel de servicios eléctricos**

<img src="img/importar_servicios.png" alt="Ventana para importar archivo Excel">

<br>

**Importando servicios eléctricos**

<img src="img/importando_servicios.png" alt="Importando servicios eléctricos del archivo Excel">

<br>


**Consultas**

<img src="img/consultas.png" alt="Página de consultas">
<br>

<img src="img/consultas_2.png" alt="Página de consultas">
<br>

<img src="img/consumo_por_mes_entidad.png" alt="Página de consultas">
<br>

<img src="img/consumo_por_mes_entidad2.png" alt="Página de consultas">
<br>


**Modelo lógico de la aplicación**

<img src="img/modelo_lógico.png" alt="Modelo lógico de la aplicación">
<br>

<img src="img/modelo_lógico2.png" alt="Modelo lógico de la aplicación">

