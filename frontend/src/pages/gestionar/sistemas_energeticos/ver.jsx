import { CrudDetail } from '../../../components/CrudDetail';
import {
  getSistemaEnergeticoById,
  deleteSistemaEnergetico,
} from '../../../api/crud_modelos/sistemas_energeticos';

const fields = [
  { key: 'nombre', label: 'Nombre del sistema' },
  { key: 'categoria_nombre', label: 'Categoría' },
  { key: 'created_at', label: 'Creado' },
  { key: 'updated_at', label: 'Actualizado' },
];

export function SistemasEnergeticosDetail() {
  return (
    <CrudDetail
      title="Detalles del Sistema Energético"
      getItem={getSistemaEnergeticoById}
      deleteItem={deleteSistemaEnergetico}
      fields={fields}
      basePath="/gestionar/sistemas-energeticos"
      itemName="Sistema energético"
    />
  );
}