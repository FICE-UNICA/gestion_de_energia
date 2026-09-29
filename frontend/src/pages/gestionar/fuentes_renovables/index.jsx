import { useState, useEffect } from 'react';
import { CrudIndex } from '../../../components/CrudIndex';
import { getAllFuentesRenovables, deleteFuenteRenovable } from '../../../api/crud_modelos/fuentes_renovables';

const columns = [
  { key: 'nombre', label: 'Nombre' },
];

export function FuentesRenovablesIndex() {
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
      const result = await getAllFuentesRenovables(currentPage, searchTerm);
      setData(result.results || []);
      setTotalCount(result.count || 0);
      setTotalPages(Math.ceil((result.count || 0) / 100));
    } catch (error) {
      console.error('Error cargando Fuentes Renovables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentPage, searchTerm]);

  return (
    <CrudIndex
      title="Gestionar Fuentes Renovables ⚡"
      items={data}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onSearch={setSearchTerm}
      searchTerm={searchTerm}
      deleteItem={deleteFuenteRenovable}
      onRefresh={fetchData}
      columns={columns}
      basePath="/gestionar/fuentes-renovables"
      itemName="Fuente renovable"
      totalCount={totalCount}
      loading={loading}
    />
  );
}