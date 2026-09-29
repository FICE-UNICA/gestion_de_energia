import { CrudForm } from '../../../components/CrudForm';
import { useParams } from 'react-router-dom';
import {
  getSistemaEnergeticoById,
  createSistemaEnergetico,
  updateSistemaEnergetico,
  deleteSistemaEnergetico,
} from '../../../api/crud_modelos/sistemas_energeticos';
import { searchEntidad } from '../../../api/crud_modelos/entidad';
import { searchCategoriaSistemaEnergetico } from '../../../api/crud_modelos/categoria_sistema_energetico';

export function SistemasEnergeticosForm() {
  const { id } = useParams();

  const fields = [
    {
      name: 'nombre',
      label: 'Nombre del sistema',
      type: 'text',
      required: true,
      placeholder: 'Ej: Caldera #1',
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'autoselect',
      required: true,
      loadOptions: searchCategoriaSistemaEnergetico,
      placeholder: 'Buscar categoría...',
    },
   
    {
      name: 'entidades',
      label: 'Entidades donde opera',
      type: 'multiautoselect',
      required: false,
      loadOptions: searchEntidad,
      placeholder: 'Buscar entidad por nombre o código REEUP...',
    },
  ];

  const getItemWithLabel = async (id) => {
    const data = await getSistemaEnergeticoById(id);
    if (data.categoria && data.categoria_nombre) {
      data.categoria = {
        value: data.categoria,
        label: data.categoria_nombre,
      };
    }
    return data;
  };

  return (
    <CrudForm
      title={id ? 'Editar Sistema Energético' : 'Crear Sistema Energético'}
      fields={fields}
      getItem={id ? getItemWithLabel : undefined}
      createItem={createSistemaEnergetico}
      updateItem={updateSistemaEnergetico}
      deleteItem={deleteSistemaEnergetico}
      basePath="/gestionar/sistemas-energeticos"
      itemName="Sistema energético"
    />
  );
}