import { CrudDetail } from '../../../components/CrudDetail';
import {
  getCategoriaSistemaEnergeticoById,
  deleteCategoriaSistemaEnergetico,
} from '../../../api/crud_modelos/categoria_sistema_energetico';

const fields = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'total_sistemas', label: 'Sistemas asociados' },
  { key: 'created_at', label: 'Creado' },
  { key: 'updated_at', label: 'Actualizado' },
];

export function CategoriaSistemaEnergeticoDetail() {
  return (
    <CrudDetail
      title="Detalles de la Categoría"
      getItem={getCategoriaSistemaEnergeticoById}
      deleteItem={deleteCategoriaSistemaEnergetico}
      fields={fields}
      basePath="/gestionar/categoria-sistema-energetico"
      itemName="Categoría de sistema energético"
    />
  );
}