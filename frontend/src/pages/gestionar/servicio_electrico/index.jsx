// src/pages/gestionar/servicio_electrico/index.jsx

import { useState, useEffect } from 'react';
import { CrudIndex } from '../../../components/CrudIndex';
import { 
  getAllServicioElectrico, 
  deleteServicioElectrico, 
  importarServicioElectrico,
  deleteAllServicioElectrico      
} from '../../../api/crud_modelos/servicio_electrico';
import { getAñosDisponibles } from '../../../api/crud_modelos/servicio_electrico';
import axios from '../../../api/axios'; 

const columns = [
  { key: 'codigo_servicio', label: 'Código' },
  { key: 'mes_nombre', label: 'Mes' },
  { key: 'año', label: 'Año' },
  { key: 'consumo_real', label: 'Consumo real (kWh)' },
  { key: 'entidad_nombre', label: 'Entidad' },
];

const mesesOptions = [
  { value: '', label: 'Todos los meses' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export function ServicioElectricoIndex() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [añosDisponibles, setAñosDisponibles] = useState([]);
  const [loadingAños, setLoadingAños] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [filters, setFilters] = useState({
    codigo_servicio: '',
    mes: '',
    año: '',
    codigo_REEUP: '',
    search: ''
  });

  // Cargar años disponibles
  useEffect(() => {
    const loadAños = async () => {
      try {
        const años = await getAñosDisponibles();
        setAñosDisponibles(años);
      } catch (error) {
        console.error('Error cargando años disponibles:', error);
      } finally {
        setLoadingAños(false);
      }
    };
    loadAños();
  }, []);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.codigo_servicio, filters.mes, filters.año, filters.codigo_REEUP, filters.search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllServicioElectrico(currentPage, filters);
      const transformedResults = (result.results || []).map(item => ({
        ...item,
        entidad_nombre: item.entidad_nombre && item.entidad_nombre.trim() !== '' 
          ? item.entidad_nombre 
          : 'Desconocido'
      }));
      setData(transformedResults);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 100));
    } catch (error) {
      console.error('Error cargando servicios eléctricos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const handleDeleteAll = async () => {
    await deleteAllServicioElectrico();
    setCurrentPage(1);
    await fetchData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
  };

  const clearFilters = () => {
    setFilters({
      codigo_servicio: '',
      mes: '',
      año: '',
      codigo_REEUP: '',
      search: ''
    });
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Seleccione un archivo primero');
      return;
    }
    setImporting(true);
    try {
      const result = await importarServicioElectrico(importFile);
      setImportResult(result);
      fetchData();
    } catch (error) {
      console.error('Error importando:', error);
      setImportResult({ error: error.response?.data?.error || 'Error al importar' });
    } finally {
      setImporting(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
  };

  const exportMissingReeupPDF = async () => {
    if (!importResult?.reeup_faltantes?.length) return;
    try {
      const response = await axios.post(
        '/servicios-electricos/exportar-reeup-pdf/',
        { reeup_faltantes: importResult.reeup_faltantes },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reeup_faltantes_${new Date().toISOString().slice(0, 19)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('No se pudo generar el PDF');
    }
  };

  return (
    <div className="bg-yellow-200 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Servicios Eléctricos</h1>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            📂 Importar Excel
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              name="codigo_servicio"
              placeholder="Código de servicio"
              value={filters.codigo_servicio}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded placeholder-slate-700"
            />
            <select
              name="mes"
              value={filters.mes}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              {mesesOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              name="año"
              value={filters.año}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded"
              disabled={loadingAños}
            >
              <option value="">Todos los años</option>
              {añosDisponibles.map(año => (
                <option key={año} value={año}>{año}</option>
              ))}
            </select>
            <input
              type="text"
              name="codigo_REEUP"
              placeholder="Código REEUP"
              value={filters.codigo_REEUP}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded placeholder-slate-700"
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
          title="Gestionar Servicios Eléctricos ⚡"
          items={data}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          searchTerm={filters.search}
          deleteItem={deleteServicioElectrico}
          onRefresh={fetchData}
          columns={columns}
          basePath="/gestionar/servicio-electrico"
          itemName="Servicio eléctrico"
          totalCount={totalCount}
          loading={loading}
          onDeleteAll={handleDeleteAll}
          itemNamePlural="Servicios eléctricos"
        />
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            {importing && (
              <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-blue-600 font-semibold">Importando...</p>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-4">Importar servicios eléctricos</h2>
            <p className="text-gray-600 mb-4">
              Seleccione un archivo Excel (.xlsx, .xls) o CSV.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="mb-4 w-full"
              disabled={importing}
            />
            {importResult && (
              <div className={`mb-4 p-2 rounded ${importResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {importResult.error ? importResult.error : (
                  <>
                    <p>✅ Insertados: {importResult.insertados}</p>
                    <p>🔄 Duplicados: {importResult.duplicados}</p>
                    <p>📄 Total procesados: {importResult.total_procesados}</p>
                    {importResult.reeup_faltantes?.length > 0 && (
                      <p className="text-yellow-600">
                        ⚠️ REEUP faltantes: {importResult.reeup_faltantes.length} código(s) no encontrado(s)
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3 flex-wrap">
              {importResult && !importResult.error && importResult.reeup_faltantes?.length > 0 && (
                <button
                  onClick={exportMissingReeupPDF}
                  disabled={importing}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  📄 Exportar PDF (REEUP faltantes)
                </button>
              )}
              <button
                onClick={closeImportModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={importing}
              >
                Cerrar
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}