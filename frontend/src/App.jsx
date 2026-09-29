//App.jsx

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/login';
import { Inicio } from './pages/inicio';
import { Perfil } from './pages/perfil';
import { Navegación } from './components/Navegación';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { SuperUserRoute } from './components/SuperUserRoute';
import { AuthProvider, useAuth } from './components/Auth';
import { Consultas } from './pages/consultas';

// Gestión de Organismo
import { OrganismoIndex } from './pages/gestionar/organismo';
import { OrganismoForm } from './pages/gestionar/organismo/formulario';
import { OrganismoDetail } from './pages/gestionar/organismo/ver';

// Gestión de Provincias
import { ProvinciaIndex } from './pages/gestionar/provincia';
import { ProvinciaForm } from './pages/gestionar/provincia/formulario';
import { ProvinciaDetail } from './pages/gestionar/provincia/ver';

// Gestión de Municipios
import { MunicipioIndex } from './pages/gestionar/municipio';
import { MunicipioForm } from './pages/gestionar/municipio/formulario';
import { MunicipioDetail } from './pages/gestionar/municipio/ver';

// Gestión de Entidades
import { EntidadIndex } from './pages/gestionar/entidad';
import { EntidadForm } from './pages/gestionar/entidad/formulario';
import { EntidadDetail } from './pages/gestionar/entidad/ver';

// Gestión de Directores
import { DirectorIndex } from './pages/gestionar/director';
import { DirectorForm } from './pages/gestionar/director/formulario';
import { DirectorDetail } from './pages/gestionar/director/ver';

// Gestión de Servicios Eléctricos
import { ServicioElectricoIndex } from './pages/gestionar/servicio_electrico';
import { ServicioElectricoForm } from './pages/gestionar/servicio_electrico/formulario';
import { ServicioElectricoDetail } from './pages/gestionar/servicio_electrico/ver';

// Gestión de NAE
import { NAEIndex } from './pages/gestionar/nae';
import { NAEForm } from './pages/gestionar/nae/formulario';
import { NAEDetail } from './pages/gestionar/nae/ver';

// Gestión de Usuario
import { UsuarioIndex } from './pages/gestionar/usuario/index';
import { UsuarioForm } from './pages/gestionar/usuario/formulario';
import { UsuarioDetail } from './pages/gestionar/usuario/ver';

// Gestión de Fuentes Renovables
import { FuentesRenovablesIndex } from './pages/gestionar/fuentes_renovables';
import { FuentesRenovablesForm } from './pages/gestionar/fuentes_renovables/formulario';
import { FuentesRenovablesDetail } from './pages/gestionar/fuentes_renovables/ver';

// Gestión de Sistemas Energéticos
import { SistemasEnergeticosIndex } from './pages/gestionar/sistemas_energeticos';
import { SistemasEnergeticosForm } from './pages/gestionar/sistemas_energeticos/formulario';
import { SistemasEnergeticosDetail } from './pages/gestionar/sistemas_energeticos/ver';

import { CategoriaSistemaEnergeticoIndex } from './pages/gestionar/categoria_sistema_energetico';
import { CategoriaSistemaEnergeticoForm } from './pages/gestionar/categoria_sistema_energetico/formulario';
import { CategoriaSistemaEnergeticoDetail } from './pages/gestionar/categoria_sistema_energetico/ver';

import { GestionarBD } from './pages/gestionar_bd.jsx';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const hideNavigationRoutes = ['/', '/login'];
  const shouldShowNavigation = !hideNavigationRoutes.includes(location.pathname) && isAuthenticated;

  return (
    <div className="min-h-screen">
      {shouldShowNavigation && <Navegación />}

      <Toaster
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route path="/inicio" element={<PrivateRoute><Inicio /></PrivateRoute>} />
        <Route path="/consultas" element={<PrivateRoute><Consultas /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />


        {/* Rutas para administradores */}

        {/* Gestión de Organismo */}
        <Route path="/gestionar/organismo" element={<AdminRoute><OrganismoIndex /></AdminRoute>} />
        <Route path="/gestionar/organismo/crear" element={<AdminRoute><OrganismoForm /></AdminRoute>} />
        <Route path="/gestionar/organismo/editar/:id" element={<AdminRoute><OrganismoForm /></AdminRoute>} />
        <Route path="/gestionar/organismo/ver/:id" element={<AdminRoute><OrganismoDetail /></AdminRoute>} />

        {/* Gestión de Provincias */}
        <Route path="/gestionar/provincia" element={<AdminRoute><ProvinciaIndex /></AdminRoute>} />
        <Route path="/gestionar/provincia/crear" element={<AdminRoute><ProvinciaForm /></AdminRoute>} />
        <Route path="/gestionar/provincia/editar/:id" element={<AdminRoute><ProvinciaForm /></AdminRoute>} />
        <Route path="/gestionar/provincia/ver/:id" element={<AdminRoute><ProvinciaDetail /></AdminRoute>} />

        {/* Gestión de Municipios */}
        <Route path="/gestionar/municipio" element={<AdminRoute><MunicipioIndex /></AdminRoute>} />
        <Route path="/gestionar/municipio/crear" element={<AdminRoute><MunicipioForm /></AdminRoute>} />
        <Route path="/gestionar/municipio/editar/:id" element={<AdminRoute><MunicipioForm /></AdminRoute>} />
        <Route path="/gestionar/municipio/ver/:id" element={<AdminRoute><MunicipioDetail /></AdminRoute>} />

        {/* Gestión de Entidades */}
        <Route path="/gestionar/entidad" element={<AdminRoute><EntidadIndex /></AdminRoute>} />
        <Route path="/gestionar/entidad/crear" element={<AdminRoute><EntidadForm /></AdminRoute>} />
        <Route path="/gestionar/entidad/editar/:id" element={<AdminRoute><EntidadForm /></AdminRoute>} />
        <Route path="/gestionar/entidad/ver/:id" element={<AdminRoute><EntidadDetail /></AdminRoute>} />

        {/* Gestión de Directores */}
        <Route path="/gestionar/director" element={<AdminRoute><DirectorIndex /></AdminRoute>} />
        <Route path="/gestionar/director/crear" element={<AdminRoute><DirectorForm /></AdminRoute>} />
        <Route path="/gestionar/director/editar/:id" element={<AdminRoute><DirectorForm /></AdminRoute>} />
        <Route path="/gestionar/director/ver/:id" element={<AdminRoute><DirectorDetail /></AdminRoute>} />

        {/* Gestión de Servicios Eléctricos */}
        <Route path="/gestionar/servicio-electrico" element={<AdminRoute><ServicioElectricoIndex /></AdminRoute>} />
        <Route path="/gestionar/servicio-electrico/crear" element={<AdminRoute><ServicioElectricoForm /></AdminRoute>} />
        <Route path="/gestionar/servicio-electrico/editar/:id" element={<AdminRoute><ServicioElectricoForm /></AdminRoute>} />
        <Route path="/gestionar/servicio-electrico/ver/:id" element={<AdminRoute><ServicioElectricoDetail /></AdminRoute>} />

        {/* Gestión de NAE */}
        <Route path="/gestionar/nae" element={<AdminRoute><NAEIndex /></AdminRoute>} />
        <Route path="/gestionar/nae/crear" element={<AdminRoute><NAEForm /></AdminRoute>} />
        <Route path="/gestionar/nae/editar/:id" element={<AdminRoute><NAEForm /></AdminRoute>} />
        <Route path="/gestionar/nae/ver/:id" element={<AdminRoute><NAEDetail /></AdminRoute>} />

        {/* Gestión de Usuario (solo superusuario) */}
        <Route path="/gestionar/usuario" element={<SuperUserRoute><UsuarioIndex /></SuperUserRoute>} />
        <Route path="/gestionar/usuario/crear" element={<SuperUserRoute><UsuarioForm /></SuperUserRoute>} />
        <Route path="/gestionar/usuario/editar/:id" element={<SuperUserRoute><UsuarioForm /></SuperUserRoute>} />
        <Route path="/gestionar/usuario/ver/:id" element={<SuperUserRoute><UsuarioDetail /></SuperUserRoute>} />

        {/* Gestión de Fuentes Renovables */}
        <Route path="/gestionar/fuentes-renovables" element={<AdminRoute><FuentesRenovablesIndex /></AdminRoute>} />
        <Route path="/gestionar/fuentes-renovables/crear" element={<AdminRoute><FuentesRenovablesForm /></AdminRoute>} />
        <Route path="/gestionar/fuentes-renovables/editar/:id" element={<AdminRoute><FuentesRenovablesForm /></AdminRoute>} />
        <Route path="/gestionar/fuentes-renovables/ver/:id" element={<AdminRoute><FuentesRenovablesDetail /></AdminRoute>} />

        {/* Gestión de Sistemas Energéticos */}
        <Route path="/gestionar/sistemas-energeticos" element={<AdminRoute><SistemasEnergeticosIndex /></AdminRoute>} />
        <Route path="/gestionar/sistemas-energeticos/crear" element={<AdminRoute><SistemasEnergeticosForm /></AdminRoute>} />
        <Route path="/gestionar/sistemas-energeticos/editar/:id" element={<AdminRoute><SistemasEnergeticosForm /></AdminRoute>} />
        <Route path="/gestionar/sistemas-energeticos/ver/:id" element={<AdminRoute><SistemasEnergeticosDetail /></AdminRoute>} />

        {/* Gestión de Categoría Sistema Energético */}
        <Route path="/gestionar/categoria-sistema-energetico" element={<AdminRoute><CategoriaSistemaEnergeticoIndex /></AdminRoute>} />
        <Route path="/gestionar/categoria-sistema-energetico/crear" element={<AdminRoute><CategoriaSistemaEnergeticoForm /></AdminRoute>} />
        <Route path="/gestionar/categoria-sistema-energetico/editar/:id" element={<AdminRoute><CategoriaSistemaEnergeticoForm /></AdminRoute>} />
        <Route path="/gestionar/categoria-sistema-energetico/ver/:id" element={<AdminRoute><CategoriaSistemaEnergeticoDetail /></AdminRoute>} />

        <Route path="/gestionar/base_datos" element={<SuperUserRoute><GestionarBD /></SuperUserRoute>} />


      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;