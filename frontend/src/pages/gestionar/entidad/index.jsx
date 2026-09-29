import { useState, useEffect } from 'react';
import { CrudIndex } from '../../../components/CrudIndex';
import { getAllEntidad, deleteEntidad } from '../../../api/crud_modelos/entidad';
import { getAllMunicipio } from '../../../api/crud_modelos/municipio';
import { searchOrganismo } from '../../../api/crud_modelos/organismo';
import AsyncSelect from 'react-select/async';

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'organismo', label: 'Organismo' },
  { key: 'municipio_nombre', label: 'Municipio' },
];

const tipoOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'presupuestada', label: 'Presupuestada' }
];

export function EntidadIndex() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    municipio: '',
    tipo: '',
    codigo_REEUP: '',
    organismo: '',
    search: ''
  });

  const [municipios, setMunicipios] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const municipiosRes = await getAllMunicipio();
        setMunicipios((municipiosRes.results || []).map(m => m.nombre).sort());
      } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.municipio, filters.tipo, filters.codigo_REEUP, filters.organismo, filters.search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllEntidad(currentPage, filters);
      const transformedResults = (result.results || []).map(item => ({
        ...item,
        nombre: item?.nombre ? item.nombre : 'DESCONOCIDO'
      }));
      setData(transformedResults);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 100));
    } catch (error) {
      console.error('Error cargando entidades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOrganismoChange = (selected) => {
    setFilters(prev => ({ ...prev, organismo: selected ? selected.value : '' }));
  };

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
  };

  const clearFilters = () => {
    setFilters({ municipio: '', tipo: '', codigo_REEUP: '', organismo: '', search: '' });
  };

  if (loadingOptions) {
    return <div className="text-center py-12">Cargando filtros...</div>;
  }

  return (
    <div className="bg-yellow-200 min-h-screen">
      <div className="bg-white p-4 rounded-xl shadow-xl mb-6 mx-auto max-w-7xl">
        <h2 className="text-xl font-bold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="municipio"
            value={filters.municipio}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Todos los municipios</option>
            {municipios.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            name="tipo"
            value={filters.tipo}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            {tipoOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="col-span-1">
            <AsyncSelect
              loadOptions={searchOrganismo}
              placeholder="Buscar organismo..."
              onChange={handleOrganismoChange}
              isClearable
              defaultOptions
              className="react-select-container"
              classNamePrefix="react-select"
              value={filters.organismo ? { value: filters.organismo, label: `Código ${filters.organismo}` } : null}
            />
          </div>
          <input
            type="text"
            name="codigo_REEUP"
            placeholder="Código REEUP"
            value={filters.codigo_REEUP}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded placeholder-gray-600"
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <CrudIndex
        title="Gestionar Entidades 🏢"
        items={data}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSearch={handleSearch}
        searchTerm={filters.search}
        deleteItem={deleteEntidad}
        onRefresh={fetchData}
        columns={columns}
        basePath="/gestionar/entidad"
        itemName="Entidad"
        totalCount={totalCount}
        loading={loading}
      />
    </div>
  );
}