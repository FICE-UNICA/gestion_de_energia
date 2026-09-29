import { useState, useEffect } from 'react';
import { CrudIndex } from '../../../components/CrudIndex';
import {
  getAllCategoriaSistemaEnergetico,
  deleteCategoriaSistemaEnergetico,
} from '../../../api/crud_modelos/categoria_sistema_energetico';

const columns = [
  { key: 'nombre', label: 'Nombre' },

];

export function CategoriaSistemaEnergeticoIndex() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAllCategoriaSistemaEnergetico(currentPage, searchTerm);
      setData(result.results || []);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 100));
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentPage, searchTerm]);

  return (
    <CrudIndex
      title="Gestionar Categorías de Sistemas Energéticos 🗂️"
      items={data}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onSearch={setSearchTerm}
      searchTerm={searchTerm}
      deleteItem={deleteCategoriaSistemaEnergetico}
      onRefresh={fetchData}
      columns={columns}
      basePath="/gestionar/categoria-sistema-energetico"
      itemName="Categoría de sistema energético"
      totalCount={totalCount}
      loading={loading}
    />
  );
}