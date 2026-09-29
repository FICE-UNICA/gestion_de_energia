import { CrudForm } from '../../../components/CrudForm';
import { useParams } from 'react-router-dom';
import {
  getCategoriaSistemaEnergeticoById,
  createCategoriaSistemaEnergetico,
  updateCategoriaSistemaEnergetico,
  deleteCategoriaSistemaEnergetico,
} from '../../../api/crud_modelos/categoria_sistema_energetico';

const fields = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    placeholder: 'Ej: Sistemas de refrigeración',
  },
 
];

export function CategoriaSistemaEnergeticoForm() {
  const { id } = useParams();
  return (
    <CrudForm
      title={id ? 'Editar Categoría' : 'Crear Categoría'}
      fields={fields}
      getItem={getCategoriaSistemaEnergeticoById}
      createItem={createCategoriaSistemaEnergetico}
      updateItem={updateCategoriaSistemaEnergetico}
      deleteItem={deleteCategoriaSistemaEnergetico}
      basePath="/gestionar/categoria-sistema-energetico"
      itemName="Categoría de sistema energético"
    />
  );
}