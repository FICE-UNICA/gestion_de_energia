import api from '../axios';

const RESOURCE = '/sistemas-energeticos/';

export const getAllSistemasEnergeticos = async (page = 1, search = '') => {
  const params = { page };
  if (search) params.search = search;
  const { data } = await api.get(RESOURCE, { params });
  return data;
};

export const getSistemaEnergeticoById = async (id) => {
  const { data } = await api.get(`${RESOURCE}${id}/`);
  return data;
};

export const createSistemaEnergetico = async (payload) => {
  const { data } = await api.post(RESOURCE, payload);
  return data;
};

export const updateSistemaEnergetico = async (id, payload) => {
  const { data } = await api.put(`${RESOURCE}${id}/`, payload);
  return data;
};

export const deleteSistemaEnergetico = async (id) => {
  const { data } = await api.delete(`${RESOURCE}${id}/`);
  return data;
};

export const searchSistemaEnergetico = async (inputValue) => {
  const { data } = await api.get('/sistemas-energeticos/', {
    params: { search: inputValue },
  });
  const list = data.results || data;
  return list.map((s) => ({
    value: s.id,
    label: `${s.nombre}${s.categoria_nombre ? ' — ' + s.categoria_nombre : ''}`,
  }));
};