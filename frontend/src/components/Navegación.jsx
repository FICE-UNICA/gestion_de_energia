import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../api/auth";
import { useAuth } from "./Auth";

export function Navegación() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const closeMobileMenu = () => setIsMenuOpen(false);

  // Verificar si el usuario tiene permisos de administrador (staff o superuser)
  const isAdmin = user && (user.is_staff === true || user.is_superuser === true);
  const isSuperUser = user && user.is_superuser === true;

  // Construir las secciones dinámicamente
  const sections = [
    {
      title: "Entidades 🏢",
      items: [
        { name: 'Organismo', path: '/gestionar/organismo' },
        { name: 'Entidad', path: '/gestionar/entidad' },
        { name: 'NAE', path: '/gestionar/nae' },
      ]
    },
    {
      title: "Energía ⚡",
      items: [
        { name: 'Servicio eléctrico', path: '/gestionar/servicio-electrico' },
        { name: 'Fuentes renovables', path: '/gestionar/fuentes-renovables' },
        { name: 'Categorías Sistemas Energéticos', path: '/gestionar/categoria-sistema-energetico' },
        { name: 'Sistemas energéticos', path: '/gestionar/sistemas-energeticos' },
      ]
    },
    {
      title: "Localidad 🌍",
      items: [
        { name: 'Provincia', path: '/gestionar/provincia' },
        { name: 'Municipio', path: '/gestionar/municipio' },
      ]
    },
  ];

  // Solo agregar la sección avanzada si el usuario es superusuario
  if (isSuperUser) {
    sections.push({
      title: "Opciones avanzadas 🖥️",
      items: [
        { name: 'Usuarios 👤', path: '/gestionar/usuario' }, 
        { name: 'Base de Datos 🗄️', path: '/gestionar/base_datos' },
      ]
    });
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-yellow-600 to-red-700 shadow-lg relative z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo y menú hamburguesa (solo si es admin) */}
            <div className="flex items-center">
              {isAdmin && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white p-3 mr-2 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  aria-label="Abrir menú de gestión"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Link to={'/inicio'} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SGE</span>
                </div>
              </Link>
            </div>

            {/* Navegación escritorio */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to={'/inicio'} className="text-white hover:text-blue-200 py-2 px-3 rounded-lg hover:bg-white/20 transition-colors">Inicio</Link>
              <Link to={'/consultas'} className="text-white hover:text-blue-200 py-2 px-3 rounded-lg hover:bg-white/20 transition-colors">Consultas</Link>
              <Link to={'/perfil'} className="text-white hover:text-blue-200 py-2 px-3 rounded-lg hover:bg-white/20 transition-colors">Perfil</Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-red-200 py-2 px-3 rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Botón menú móvil (solo si es admin) */}
            {isAdmin && (
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-3 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                  aria-label="Abrir menú"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Menú móvil desplegable con overlay (solo si es admin) */}
          {isAdmin && isMenuOpen && (
            <>
              {/* Overlay para cerrar al tocar fuera */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={closeMobileMenu}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 left-0 top-16 mx-4 md:hidden py-4 bg-gradient-to-r from-yellow-600 to-red-700 rounded-lg shadow-xl z-50"
              >
                <div className="flex flex-col space-y-2 px-2">
                  <Link
                    to={'/inicio'}
                    onClick={closeMobileMenu}
                    className="text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Inicio
                  </Link>
                  <Link
                    to={'/consultas'}
                    onClick={closeMobileMenu}
                    className="text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Consultas
                  </Link>
                  <Link
                    to={'/perfil'}
                    onClick={closeMobileMenu}
                    className="text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="text-left text-white px-4 py-3 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar de gestión con overlay (solo si es admin) */}
      {isAdmin && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeSidebar} />
          <div
            className={`absolute left-0 top-0 h-full w-64 bg-gradient-to-b from-yellow-600 to-red-700 shadow-xl transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-5 flex flex-col h-full">
              <h2 className="text-white text-2xl font-bold mb-6 border-b border-white/30 pb-2">
                Gestionar
              </h2>
              <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-2">{section.title}</h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            onClick={closeSidebar}
                            className="block text-white hover:bg-white/20 px-3 py-3 rounded transition-colors duration-200 text-sm"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}