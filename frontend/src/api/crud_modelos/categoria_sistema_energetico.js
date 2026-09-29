import api from '../axios';

const RESOURCE = '/categorias-sistemas-energeticos/';

export const getAllCategoriaSistemaEnergetico = async (page = 1, search = '') => {
  const params = { page };
  if (search) params.search = search;
  const { data } = await api.get(RESOURCE, { params });
  return data;
};

export const getCategoriaSistemaEnergeticoById = async (id) => {
  const { data } = await api.get(`${RESOURCE}${id}/`);
  return data;
};

export const createCategoriaSistemaEnergetico = async (payload) => {
  const { data } = await api.post(RESOURCE, payload);
  return data;
};

export const updateCategoriaSistemaEnergetico = async (id, payload) => {
  const { data } = await api.put(`${RESOURCE}${id}/`, payload);
  return data;
};

export const deleteCategoriaSistemaEnergetico = async (id) => {
  const { data } = await api.delete(`${RESOURCE}${id}/`);
  return data;
};

/**
 * Para `autoselect`: recibe el texto de búsqueda y devuelve
 * opciones en formato { value, label }.
 */
export const searchCategoriaSistemaEnergetico = async (inputValue) => {
  const { data } = await api.get(RESOURCE, {
    params: { search: inputValue },
  });
  const list = data.results || data;
  return list.map((c) => ({
    value: c.id,
    label: c.nombre,
  }));
};