import { CrudDetail } from '../../../components/CrudDetail';
import { getFuenteRenovableById, deleteFuenteRenovable } from '../../../api/crud_modelos/fuentes_renovables';

const fields = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'created_at', label: 'Creado' },
  { key: 'updated_at', label: 'Actualizado' },
];

export function FuentesRenovablesDetail() {
  return (
    <CrudDetail
      title="Detalles de la Fuente Renovable"
      getItem={getFuenteRenovableById}
      deleteItem={deleteFuenteRenovable}
      fields={fields}
      basePath="/gestionar/fuentes-renovables"
      itemName="Fuente renovable"
    />
  );
}