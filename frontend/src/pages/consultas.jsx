// src/pages/consultas.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import AsyncSelect from 'react-select/async';
import { getEntidadById, searchEntidad } from '../api/crud_modelos/entidad';
import {
  getServiciosElectricosByEntidad,
  getAniosDisponiblesEntidad,
  getEntidadesSinServicio,
  getEntidadesSinNombre,
} from '../api/crud_modelos/entidad';
import { getAñosDisponibles } from '../api/crud_modelos/servicio_electrico.js';
import { searchMunicipio } from '../api/crud_modelos/municipio';
import { searchNAE } from '../api/crud_modelos/nae';
import { getAllFuentesRenovables } from '../api/crud_modelos/fuentes_renovables';
import { searchSistemaEnergetico } from '../api/crud_modelos/sistemas_energeticos';
import { ConsumoAnualChart } from '../components/ConsumoAnualChart';
import { TopEntidadesConsumo } from '../components/TopEntidadesConsumo';
import {
  getPdfReportUrl,
  getConsumoPeriodoEntidad,
  getEntidadesPorFuente,
  getEntidadesPorSistema,
  getConsumoPorNAE,
} from '../api/consultas';

const consultaOptions = [
  { value: 'info', label: '📋 Información de una entidad' },
  { value: 'consumo', label: '📊 Consumo energético por mes de una entidad' },
  { value: 'consumo_global', label: '📈 Consumo energético total por mes en un año' },
  { value: 'servicios', label: '⚡ Servicios eléctricos asociados a una entidad' },
  { value: 'top_consumo', label: '⚡ Entidades de mayor consumo energético' },
  { value: 'sin_servicio', label: '⚠️ Entidades sin servicio eléctrico asociado' },
  { value: 'sin_nombre', label: '❓ Entidades sin nombre asociado' },
  { value: 'consumo_periodo', label: '📅 Consumo en un período de una entidad' },
  { value: 'entidades_por_fuente', label: '☀️ Entidades que usan una fuente renovable' },
  { value: 'entidades_por_sistema', label: '⚙️ Entidades que usan un sistema energético' },
  { value: 'consumo_por_nae', label: '🏭 Consumo por mes de entidades con un NAE' },
];

const TOP_LIMIT_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const UNIDAD_DISPLAY = {
  KWH: 'kWh',
  MWH: 'MWh',
  GWH: 'GWh',
};

const MESES_EN_TO_ES = {
  January: 'Enero', February: 'Febrero', March: 'Marzo', April: 'Abril',
  May: 'Mayo', June: 'Junio', July: 'Julio', August: 'Agosto',
  September: 'Septiembre', October: 'Octubre', November: 'Noviembre', December: 'Diciembre',
  Jan: 'Enero', Feb: 'Febrero', Mar: 'Marzo', Apr: 'Abril',
  Jun: 'Junio', Jul: 'Julio', Aug: 'Agosto', Sep: 'Septiembre',
  Oct: 'Octubre', Nov: 'Noviembre', Dec: 'Diciembre',
};
const traducirMes = (nombre) => MESES_EN_TO_ES[nombre] || nombre;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '52px',
    fontSize: '1.05rem',
    borderColor: state.isFocused ? '#dc2626' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #dc2626' : 'none',
    '&:hover': { borderColor: '#dc2626' },
  }),
  valueContainer: (base) => ({ ...base, padding: '6px 12px' }),
  singleValue: (base) => ({ ...base, fontSize: '1.05rem', color: '#1f2937' }),
  placeholder: (base) => ({ ...base, fontSize: '1.05rem', color: '#9ca3af' }),
  input: (base) => ({ ...base, fontSize: '1.05rem' }),
  menu: (base) => ({ ...base, fontSize: '1.05rem', zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    fontSize: '1.05rem',
    padding: '10px 12px',
    backgroundColor: state.isFocused ? '#fef3c7' : state.isSelected ? '#fde68a' : 'white',
    color: '#1f2937',
    cursor: 'pointer',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6b7280' }),
  clearIndicator: (base) => ({ ...base, color: '#6b7280' }),
};

const selectTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#dc2626',
    primary25: '#fef3c7',
    primary50: '#fde68a',
    primary75: '#f59e0b',
  },
});

export function Consultas() {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedConsulta, setSelectedConsulta] = useState('');
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasQueried, setHasQueried] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [globalYears, setGlobalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [unidad, setUnidad] = useState('MWh');
  const [topLimit, setTopLimit] = useState(10);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [mesInicial, setMesInicial] = useState(1);
  const [mesFinal, setMesFinal] = useState(12);
  const [selectedFuente, setSelectedFuente] = useState(null);
  const [fuentesRenovables, setFuentesRenovables] = useState([]);
  const [selectedSistema, setSelectedSistema] = useState(null);
  const [selectedNAE, setSelectedNAE] = useState(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState(null);

  useEffect(() => {
    const fetchGlobalYears = async () => {
      try {
        const años = await getAñosDisponibles();
        setGlobalYears(años);
        if (años.length > 0) setSelectedYear(años[0]);
      } catch (e) {
        console.error('Error cargando años globales:', e);
      }
    };
    fetchGlobalYears();
  }, []);

  useEffect(() => {
    const fetchFuentes = async () => {
      try {
        const data = await getAllFuentesRenovables();
        const list = data.results || data;
        setFuentesRenovables(
          list.map((f) => ({ value: f.id, label: f.nombre }))
        );
      } catch (e) {
        console.error('Error cargando fuentes renovables:', e);
      }
    };
    fetchFuentes();
  }, []);

  const limpiarConsulta = () => {
    setSelectedConsulta('');
    setSelectedEntity(null);
    setSelectedYear(globalYears.length > 0 ? globalYears[0] : '');
    setUnidad('MWh');
    setTopLimit(10);
    setMesInicial(1);
    setMesFinal(12);
    setSelectedFuente(null);
    setSelectedSistema(null);
    setSelectedNAE(null);
    setSelectedMunicipio(null);
    setResultData(null);
    setHasQueried(false);
    setError('');
    setAvailableYears([]);
  };

  useEffect(() => {
    setResultData(null);
    setHasQueried(false);
    setError('');
    setAvailableYears([]);
  }, [selectedConsulta, selectedEntity, selectedFuente, selectedSistema, selectedNAE, selectedMunicipio]);

  useEffect(() => {
    if (selectedConsulta === 'consumo' && selectedEntity) {
      const fetchYears = async () => {
        try {
          const years = await getAniosDisponiblesEntidad(selectedEntity.value);
          setAvailableYears(years);
        } catch (err) {
          console.error(err);
          setAvailableYears([]);
        }
      };
      fetchYears();
    } else {
      setAvailableYears([]);
    }
  }, [selectedConsulta, selectedEntity]);

  const loadEntityOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      return await searchEntidad(inputValue);
    } catch (err) {
      console.error('Error en loadEntityOptions:', err);
      return [];
    }
  }, []);

  const loadNAEOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      return await searchNAE(inputValue);
    } catch (err) {
      console.error('Error en loadNAEOptions:', err);
      return [];
    }
  }, []);

  const loadSistemaOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      return await searchSistemaEnergetico(inputValue);
    } catch (err) {
      console.error('Error en loadSistemaOptions:', err);
      return [];
    }
  }, []);

  const loadMunicipioOptions = useCallback(async (inputValue) => {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      return await searchMunicipio(inputValue);
    } catch (err) {
      console.error('Error en loadMunicipioOptions:', err);
      return [];
    }
  }, []);

  const handleExecute = async () => {
    if (!selectedConsulta) {
      setError('Seleccione un tipo de consulta');
      return;
    }
    if (['info', 'consumo', 'servicios', 'consumo_periodo'].includes(selectedConsulta) && !selectedEntity) {
      setError('Debe seleccionar una entidad');
      return;
    }
    if (['consumo', 'consumo_global', 'top_consumo', 'consumo_periodo', 'consumo_por_nae'].includes(selectedConsulta) && !selectedYear) {
      setError('Seleccione un año');
      return;
    }
    if (selectedConsulta === 'entidades_por_fuente' && !selectedFuente) {
      setError('Seleccione una fuente renovable');
      return;
    }
    if (selectedConsulta === 'entidades_por_sistema' && !selectedSistema) {
      setError('Seleccione un sistema energético');
      return;
    }
    if (selectedConsulta === 'consumo_por_nae' && !selectedNAE) {
      setError('Seleccione un NAE');
      return;
    }
    if (selectedConsulta === 'consumo_periodo' && Number(mesInicial) > Number(mesFinal)) {
      setError('El mes inicial debe ser menor o igual al mes final');
      return;
    }

    setLoading(true);
    setError('');
    setHasQueried(true);
    setResultData(null);

    try {
      if (selectedConsulta === 'info') {
        const entity = await getEntidadById(selectedEntity.value);
        setResultData({ type: 'info', data: entity });
      } else if (selectedConsulta === 'servicios') {
        const servicios = await getServiciosElectricosByEntidad(selectedEntity.value);
        setResultData({ type: 'servicios', data: servicios });
      } else if (selectedConsulta === 'consumo') {
        setResultData({ type: 'consumo', data: { entityId: selectedEntity.value, year: selectedYear, entityName: selectedEntity.label, unidad } });
      } else if (selectedConsulta === 'consumo_global') {
        setResultData({ type: 'consumo_global', year: selectedYear, unidad });
      } else if (selectedConsulta === 'top_consumo') {
        setResultData({ type: 'top_consumo', year: selectedYear, unidad, limit: topLimit });
      } else if (selectedConsulta === 'sin_servicio') {
        const entidades = await getEntidadesSinServicio();
        setResultData({ type: 'list', listType: 'sin_servicio', data: entidades });
      } else if (selectedConsulta === 'sin_nombre') {
        const entidades = await getEntidadesSinNombre();
        setResultData({ type: 'list', listType: 'sin_nombre', data: entidades });
      } else if (selectedConsulta === 'consumo_periodo') {
        const data = await getConsumoPeriodoEntidad(
          selectedEntity.value, selectedYear, mesInicial, mesFinal, unidad
        );
        setResultData({ type: 'consumo_periodo', data });
      } else if (selectedConsulta === 'entidades_por_fuente') {
        // ← enviamos el ID del municipio
        const data = await getEntidadesPorFuente(selectedFuente.value, selectedMunicipio?.value || '');
        setResultData({ type: 'entidades_por_fuente', data });
      } else if (selectedConsulta === 'entidades_por_sistema') {
        // ← enviamos el ID del municipio
        const data = await getEntidadesPorSistema(selectedSistema.value, selectedMunicipio?.value || '');
        setResultData({ type: 'entidades_por_sistema', data });
      } else if (selectedConsulta === 'consumo_por_nae') {
        const data = await getConsumoPorNAE(selectedNAE.value, selectedYear, unidad);
        setResultData({ type: 'consumo_por_nae', data });
      }
    } catch (err) {
      console.error(err);
      setError('Error al ejecutar la consulta');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedConsulta || !hasQueried) return;

    let pdfParams = { unidad };
    switch (selectedConsulta) {
      case 'info':
      case 'servicios':
        pdfParams = { entidadId: selectedEntity?.value };
        break;
      case 'consumo':
        pdfParams = { entidadId: selectedEntity?.value, anio: selectedYear, unidad };
        break;
      case 'consumo_global':
        pdfParams = { anio: selectedYear, unidad };
        break;
      case 'top_consumo':
        pdfParams = { anio: selectedYear, unidad, limit: topLimit };
        break;
      case 'consumo_periodo':
        pdfParams = {
          entidadId: selectedEntity?.value,
          anio: selectedYear,
          mesInicial,
          mesFinal,
          unidad,
        };
        break;
      case 'entidades_por_fuente':
        // ← enviamos municipioId
        pdfParams = { fuenteId: selectedFuente?.value, municipioId: selectedMunicipio?.value || '' };
        break;
      case 'entidades_por_sistema':
        // ← enviamos municipioId
        pdfParams = { sistemaId: selectedSistema?.value, municipioId: selectedMunicipio?.value || '' };
        break;
      case 'consumo_por_nae':
        pdfParams = { anio: selectedYear, naeId: selectedNAE?.value, unidad };
        break;
      default:
        pdfParams = {};
    }

    const pdfUrl = getPdfReportUrl(selectedConsulta, pdfParams);

    setGeneratingPDF(true);
    try {
      const response = await axios.get(pdfUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error(error);
      setError('No se pudo generar el PDF. Verifique su conexión o intente más tarde.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const shouldShow = (value) => value !== null && value !== undefined && value !== '';

  const renderMensualTable = (items, unidadLabel) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Mes</th>
            <th className="px-4 py-2 text-right">Total ({unidadLabel})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2">{traducirMes(item.nombre_mes)}</td>
              <td className="px-4 py-2 text-right">
                {Number(item.total).toLocaleString('es-ES', { maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEntidadesTable = (items) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Código REEUP</th>
            <th className="px-4 py-2">Municipio</th>
          </tr>
        </thead>
        <tbody>
          {items.map((ent) => (
            <tr key={ent.id} className="border-t">
              <td className="px-4 py-2">{ent.nombre || '—'}</td>
              <td className="px-4 py-2">{ent.codigo_REEUP}</td>
              <td className="px-4 py-2">{ent.municipio_nombre || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderResult = () => {
    if (!resultData) return null;

    switch (resultData.type) {
      case 'info': {
        const ent = resultData.data;
        const fields = [
          { label: 'Nombre', value: ent.nombre },
          { label: 'Código REEUP', value: ent.codigo_REEUP },
          { label: 'Municipio', value: ent.municipio_nombre },
          { label: 'Organismo', value: ent.organismo },
          { label: 'NAE', value: ent.nae_codigo ? `${ent.nae_codigo} - ${ent.nae_nombre}` : (ent.nae_nombre || null) },
          { label: 'Siglas', value: ent.siglas },
          { label: 'Cuenta bancaria', value: ent.cuenta_bancaria },
          { label: 'Teléfono', value: ent.telefono },
          { label: 'NIT', value: ent.NIT },
          { label: 'Dirección', value: ent.direccion },
          { label: 'Geolocalización', value: ent.geolocalizacion },
        ];
        const nonEmptyFields = fields.filter(f => shouldShow(f.value));
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de la entidad</h2>
            <div className="space-y-2">
              {nonEmptyFields.map((field, idx) => (
                <p key={idx}><strong>{field.label}:</strong> {field.value}</p>
              ))}
            </div>
          </div>
        );
      }
      case 'servicios':
        if (!resultData.data.length) return <div className="bg-white p-6 text-center">Esta entidad no tiene servicios eléctricos asociados.</div>;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Servicios eléctricos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Código</th>
                    <th className="px-4 py-2">Mes</th>
                    <th className="px-4 py-2">Año</th>
                    <th className="px-4 py-2">Consumo real (kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.data.map(serv => (
                    <tr key={serv.id}>
                      <td className="px-4 py-2">{serv.codigo_servicio}</td>
                      <td className="px-4 py-2">{serv.mes}</td>
                      <td className="px-4 py-2">{serv.año}</td>
                      <td className="px-4 py-2">{serv.consumo_real?.toLocaleString('es-ES') || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'consumo': {
        const { entityId, year, entityName, unidad: unidadConsumo } = resultData.data;
        return <ConsumoAnualChart año={year} entityId={entityId} entidadNombre={entityName} unidad={unidadConsumo} />;
      }
      case 'consumo_global':
        return <ConsumoAnualChart año={resultData.year} unidad={resultData.unidad} />;
      case 'top_consumo':
        return <TopEntidadesConsumo año={resultData.year} unidad={resultData.unidad} limit={resultData.limit} />;
      case 'consumo_periodo': {
        const d = resultData.data;
        const unidadLabel = UNIDAD_DISPLAY[d.unidad] || d.unidad;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Consumo del período — {d.entidad.nombre || d.entidad.codigo_REEUP}
            </h2>
            <p className="text-gray-700 mb-4 font-bold">
              Año {d.anio} · Meses {d.mes_inicial} al {d.mes_final} · Total:{' '}
              {Number(d.total_periodo).toLocaleString('es-ES', { maximumFractionDigits: 2 })}{' '}
              {unidadLabel}
            </p>
            {renderMensualTable(d.resultados, unidadLabel)}
          </div>
        );
      }
      case 'entidades_por_fuente': {
        const d = resultData.data;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Entidades que usan: {d.fuente.nombre}
            </h2>
            <p className="text-gray-600 mb-4">
              {d.municipio ? `Municipio filtrado: ${d.municipio} · ` : ''}
              Total: {d.total} entidad{d.total !== 1 ? 'es' : ''}
            </p>
            {d.resultados.length ? renderEntidadesTable(d.resultados) : <p>No hay entidades.</p>}
          </div>
        );
      }
      case 'entidades_por_sistema': {
        const d = resultData.data;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Entidades que usan: {d.sistema.nombre}
            </h2>
            <p className="text-gray-600 mb-4">
              {d.sistema.categoria ? `Categoría: ${d.sistema.categoria} · ` : ''}
              {d.municipio ? `Municipio: ${d.municipio} · ` : ''}
              Total: {d.total} entidad{d.total !== 1 ? 'es' : ''}
            </p>
            {d.resultados.length ? renderEntidadesTable(d.resultados) : <p>No hay entidades.</p>}
          </div>
        );
      }
      case 'consumo_por_nae': {
        const d = resultData.data;
        const unidadLabel = UNIDAD_DISPLAY[d.unidad] || d.unidad;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Consumo por NAE — {d.nae.codigo}: {d.nae.actividad}
            </h2>
            <p className="text-gray-600 mb-4">Año {d.anio} · Unidad {unidadLabel}</p>
            {renderMensualTable(d.resultados, unidadLabel)}
          </div>
        );
      }
      case 'list':
        if (!resultData.data.length) return <div className="bg-white p-6 text-center">No se encontraron entidades.</div>;
        let titulo = '';
        if (resultData.listType === 'sin_servicio') titulo = `Entidades sin servicio eléctrico (${resultData.data.length})`;
        else if (resultData.listType === 'sin_nombre') titulo = `Entidades sin nombre asociado (${resultData.data.length})`;
        else titulo = `Listado de entidades (${resultData.data.length})`;
        return (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{titulo}</h2>
            {renderEntidadesTable(resultData.data)}
          </div>
        );
      default:
        return null;
    }
  };

  const showEntidad = ['info', 'consumo', 'servicios', 'consumo_periodo'].includes(selectedConsulta);
  const showYear = ['consumo', 'consumo_global', 'top_consumo', 'consumo_periodo', 'consumo_por_nae'].includes(selectedConsulta);
  const showUnidad = ['consumo', 'consumo_global', 'top_consumo', 'consumo_periodo', 'consumo_por_nae'].includes(selectedConsulta);
  const showTopLimit = selectedConsulta === 'top_consumo';
  const showPeriodo = selectedConsulta === 'consumo_periodo';
  const showFuente = selectedConsulta === 'entidades_por_fuente';
  const showSistema = selectedConsulta === 'entidades_por_sistema';
  const showMunicipio = ['entidades_por_fuente', 'entidades_por_sistema'].includes(selectedConsulta);
  const showNAE = selectedConsulta === 'consumo_por_nae';

  return (
    <div className="min-h-screen bg-yellow-200 p-6">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Consultas de entidades</h1>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="mb-4">
            <label className="block text-gray-800 font-medium mb-2">Tipo de consulta:</label>
            <select
              value={selectedConsulta}
              onChange={(e) => setSelectedConsulta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Seleccione una consulta</option>
              {consultaOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {showEntidad && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Entidad:</label>
              <AsyncSelect
                loadOptions={loadEntityOptions}
                onChange={(opt) => setSelectedEntity(opt)}
                placeholder="Buscar por nombre o código REEUP..."
                isClearable
                className="w-full"
                styles={selectStyles}
                theme={selectTheme}
              />
            </div>
          )}

          {showFuente && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Fuente renovable:</label>
              <select
                value={selectedFuente?.value || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSelectedFuente(null);
                    return;
                  }
                  const opt = fuentesRenovables.find(f => String(f.value) === String(val));
                  setSelectedFuente(opt || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Seleccione una fuente renovable</option>
                {fuentesRenovables.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          {showSistema && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Sistema energético:</label>
              <AsyncSelect
                loadOptions={loadSistemaOptions}
                onChange={(opt) => setSelectedSistema(opt)}
                placeholder="Buscar sistema energético..."
                isClearable
                className="w-full"
                styles={selectStyles}
                theme={selectTheme}
              />
            </div>
          )}

          {showNAE && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">NAE:</label>
              <AsyncSelect
                loadOptions={loadNAEOptions}
                onChange={(opt) => setSelectedNAE(opt)}
                placeholder="Buscar NAE por código o actividad..."
                isClearable
                className="w-full"
                styles={selectStyles}
                theme={selectTheme}
              />
            </div>
          )}

          {showMunicipio && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Municipio (opcional):</label>
              <AsyncSelect
                loadOptions={loadMunicipioOptions}
                onChange={(opt) => setSelectedMunicipio(opt)}
                value={selectedMunicipio}
                placeholder="Buscar municipio..."
                isClearable
                className="w-full"
                styles={selectStyles}
                theme={selectTheme}
              />
            </div>
          )}

          {showYear && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Año:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Seleccione un año</option>
                {globalYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {selectedConsulta === 'consumo' && availableYears.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Años disponibles para esta entidad: {availableYears.join(', ')}
                </p>
              )}
            </div>
          )}

          {showPeriodo && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-800 font-medium mb-2">Mes inicial:</label>
                <select
                  value={mesInicial}
                  onChange={(e) => setMesInicial(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-800 font-medium mb-2">Mes final:</label>
                <select
                  value={mesFinal}
                  onChange={(e) => setMesFinal(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {showTopLimit && (
            <div className="mb-4">
              <label htmlFor="top-limit" className="block text-gray-800 font-medium mb-2">
                Cantidad (Top N):
              </label>
              <select
                id="top-limit"
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {TOP_LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
            </div>
          )}

          {showUnidad && (
            <div className="mb-4">
              <label className="block text-gray-800 font-medium mb-2">Unidad:</label>
              <div className="flex gap-2">
                {['kWh', 'MWh', 'GWh'].map(u => (
                  <button
                    key={u}
                    onClick={() => setUnidad(u)}
                    className={`px-3 py-1 rounded-md transition ${unidad === u ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-yellow-700 hover:to-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Consultando...' : 'Ejecutar consulta'}
            </button>
            <button
              onClick={limpiarConsulta}
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
            >
              Nueva consulta
            </button>
          </div>
          {error && <p className="text-red-600 mt-3 text-center">{error}</p>}
        </div>

        {hasQueried && !loading && resultData && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📄</span> {generatingPDF ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        )}

        {hasQueried && !loading && renderResult()}
      </div>
    </div>
  );
}