import axios from '../axios';

const URL = '/municipios/';

export const getAllMunicipio = async (page = 1, search = '') => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    if (search) params.append('search', search);
    const response = await axios.get(`${URL}?${params.toString()}`);
    return response.data; // { count, results, next, previous }
  } catch (error) {
    console.error('Error al obtener Municipios:', error);
    throw error;
  }
};

export const getMunicipioById = async (id) => {
  try {
    const response = await axios.get(`${URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener Municipio con id ${id}:`, error);
    throw error;
  }
};

export const createMunicipio = async (data) => {
  try {
    const response = await axios.post(URL, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear Municipio:', error);
    throw error;
  }
};

export const updateMunicipio = async (id, data) => {
  try {
    const response = await axios.put(`${URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar Municipio con id ${id}:`, error);
    throw error;
  }
};

export const deleteMunicipio = async (id) => {
  try {
    const response = await axios.delete(`${URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar Municipio con id ${id}:`, error);
    throw error;
  }
};

export const searchMunicipio = async (inputValue) => {
  const { data } = await api.get('/municipios/', {
    params: { search: inputValue },
  });
  const list = data.results || data;
  return list.map((m) => ({
    value: m.id,
    label: m.nombre,
  }));
};