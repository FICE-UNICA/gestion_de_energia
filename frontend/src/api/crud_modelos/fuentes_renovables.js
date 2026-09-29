import api from '../axios';

const RESOURCE = '/fuentes-renovables/';

export const getAllFuentesRenovables = async (page = 1, search = '') => {
  const params = { page };
  if (search) params.search = search;
  const { data } = await api.get(RESOURCE, { params });
  return data;
};

export const getFuenteRenovableById = async (id) => {
  const { data } = await api.get(`${RESOURCE}${id}/`);
  return data;
};

export const createFuenteRenovable = async (payload) => {
  const { data } = await api.post(RESOURCE, payload);
  return data;
};

export const updateFuenteRenovable = async (id, payload) => {
  const { data } = await api.put(`${RESOURCE}${id}/`, payload);
  return data;
};

export const deleteFuenteRenovable = async (id) => {
  const { data } = await api.delete(`${RESOURCE}${id}/`);
  return data;
};

export const searchFuenteRenovable = async (inputValue) => {
  const { data } = await api.get('/fuentes-renovables/', {
    params: { search: inputValue },
  });
  const list = data.results || data;
  return list.map((f) => ({ value: f.id, label: f.nombre }));
};