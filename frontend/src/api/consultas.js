import axios from './axios';

export const getConsumoPorMes = async (anio, unidad = 'kWh') => {
  const response = await axios.get(`/consultas/consumo-por-mes/`, { params: { anio, unidad } });
  return response.data;
};

export const getTopEntidadesConsumo = async (anio, unidad = 'kWh', limit = 10) => {
  const response = await axios.get(`/consultas/top-entidades/${anio}/`, { params: { unidad, limit } });
  return response.data;
};

export const getConsumoPeriodoEntidad = async (entidadId, anio, mesInicial, mesFinal, unidad = 'kWh') => {
  const response = await axios.get(`/consultas/consumo-periodo/${entidadId}/`, {
    params: { anio, mes_inicial: mesInicial, mes_final: mesFinal, unidad },
  });
  return response.data;
};

export const getEntidadesPorFuente = async (fuenteId, municipioId = '') => {
  const response = await axios.get(`/consultas/entidades-por-fuente/${fuenteId}/`, {
    params: municipioId ? { municipio_id: municipioId } : {},
  });
  return response.data;
};

export const getEntidadesPorSistema = async (sistemaId, municipioId = '') => {
  const response = await axios.get(`/consultas/entidades-por-sistema/${sistemaId}/`, {
    params: municipioId ? { municipio_id: municipioId } : {},
  });
  return response.data;
};

export const getConsumoPorNAE = async (naeId, anio, unidad = 'kWh') => {
  const response = await axios.get(`/consultas/consumo-por-nae/`, {
    params: { anio, nae_id: naeId, unidad },
  });
  return response.data;
};


export const getPdfReportUrl = (consulta, params = {}) => {
  const search = new URLSearchParams();
  search.append('consulta', consulta);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const baseURL = axios.defaults.baseURL || '';
  return `${baseURL}/generar-pdf/?${search.toString()}`;
};