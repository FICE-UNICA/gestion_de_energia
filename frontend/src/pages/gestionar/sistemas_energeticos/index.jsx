import { useState, useEffect } from 'react';
import { CrudIndex } from '../../../components/CrudIndex';
import {
  getAllSistemasEnergeticos,
  deleteSistemaEnergetico,
} from '../../../api/crud_modelos/sistemas_energeticos';

const columns = [
  { key: 'nombre', label: 'Nombre del sistema' },
  { key: 'categoria_nombre', label: 'Categoría' },
];

export function SistemasEnergeticosIndex() {
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
      const result = await getAllSistemasEnergeticos(currentPage, searchTerm);
      setData(result.results || []);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 100));
    } catch (error) {
      console.error('Error cargando Sistemas Energéticos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentPage, searchTerm]);

  return (
    <CrudIndex
      title="Gestionar Sistemas Energéticos ⚡"
      items={data}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onSearch={setSearchTerm}
      searchTerm={searchTerm}
      deleteItem={deleteSistemaEnergetico}
      onRefresh={fetchData}
      columns={columns}
      basePath="/gestionar/sistemas-energeticos"
      itemName="Sistema energético"
      totalCount={totalCount}
      loading={loading}
    />
  );
}