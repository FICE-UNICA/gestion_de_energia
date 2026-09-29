import { CrudForm } from '../../../components/CrudForm';
import { useParams } from 'react-router-dom';
import {
  getFuenteRenovableById,
  createFuenteRenovable,
  updateFuenteRenovable,
  deleteFuenteRenovable,
} from '../../../api/crud_modelos/fuentes_renovables';
import { searchEntidad } from '../../../api/crud_modelos/entidad';

const fields = [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    placeholder: 'Ej: Energía solar',
  },
  {
    name: 'entidades',
    label: 'Entidades que la usan',
    type: 'multiautoselect',
    required: false,
    loadOptions: searchEntidad,
    placeholder: 'Buscar entidad por nombre o código REEUP...',
  },
];

export function FuentesRenovablesForm() {
  const { id } = useParams();
  return (
    <CrudForm
      title={id ? 'Editar Fuente Renovable' : 'Crear Fuente Renovable'}
      fields={fields}
      getItem={getFuenteRenovableById}
      createItem={createFuenteRenovable}
      updateItem={updateFuenteRenovable}
      deleteItem={deleteFuenteRenovable}
      basePath="/gestionar/fuentes-renovables"
      itemName="Fuente renovable"
    />
  );
}