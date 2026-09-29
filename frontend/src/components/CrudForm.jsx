import { useForm, Controller, useWatch, FormProvider } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';

export function CrudForm({
  title,
  fields,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  basePath,
  itemName,
  initialData = null,
  children,
  customValidate,
}) {
  const methods = useForm();
  const { register, handleSubmit, formState: { errors }, reset, control } = methods;
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = !!params.id;
  const formValues = useWatch({ control });
  const submitAction = useRef('save');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isEditing) {
      loadItem();
    } else if (initialData) {
      reset(normalizeMultiFields(initialData));
    }
  }, []);

  /**
   * Convierte campos `multiautoselect` que vienen del backend
   * a la forma [{ value, label }] usando `_info` cuando está disponible.
   */
  const normalizeMultiFields = (data) => {
    const copy = { ...data };
    fields.forEach(field => {
      if (field.type !== 'multiautoselect') return;
      const rawValue = copy[field.name];
      if (!Array.isArray(rawValue)) return;

      const alreadyObjects = rawValue.every(
        v => v && typeof v === 'object' && 'value' in v
      );
      if (alreadyObjects) return;

      const infoKey = `${field.name}_info`;
      const info = copy[infoKey];

      if (Array.isArray(info)) {
        copy[field.name] = info.map(e => ({
          value: e.id,
          label: e.nombre || e.label || `#${e.id}`,
        }));
      }
      // Si no hay info, se dejan los IDs planos; AsyncSelect los resolverá
      // cuando el usuario haga búsqueda (aunque no aparecerán chips hasta entonces).
    });
    return copy;
  };

  const loadItem = async () => {
    try {
      const data = await getItem(params.id);
      reset(normalizeMultiFields(data));
    } catch (error) {
      console.error(`Error cargando ${itemName}:`, error);
      toast.error(`Error al cargar datos`);
    }
  };

  const performSave = async (data, stay) => {
    if (customValidate && !customValidate(data)) {
      return;
    }

    const processedData = { ...data };
    delete processedData.confirm_password;

    // Eliminar campos `_info` que son solo de lectura
    Object.keys(processedData).forEach(key => {
      if (key.endsWith('_info')) delete processedData[key];
    });

    fields.forEach(field => {
      const value = data[field.name];

      if (field.type === 'autoselect') {
        if (value && typeof value === 'object' && 'value' in value) {
          processedData[field.name] = value.value;
        } else {
          processedData[field.name] = value;
        }
      } else if (field.type === 'multiautoselect') {
        if (Array.isArray(value)) {
          processedData[field.name] = value.map(v =>
            v && typeof v === 'object' && 'value' in v ? v.value : v
          );
        } else {
          processedData[field.name] = [];
        }
      } else if (field.type === 'number' && !field.required) {
        if (value === '' || value === null || value === undefined) {
          processedData[field.name] = null;
        } else {
          const num = Number(value);
          processedData[field.name] = isNaN(num) ? null : num;
        }
      } else if (field.type === 'select' && !field.required && value === '') {
        processedData[field.name] = null;
      }
    });

    fields.forEach(field => {
      const value = processedData[field.name];
      if (
        !field.required &&
        field.type !== 'multiautoselect' &&
        typeof value === 'string' &&
        value.trim() === ''
      ) {
        processedData[field.name] = null;
      }
    });

    try {
      if (isEditing) {
        await updateItem(params.id, processedData);
        toast.success(`${itemName} actualizado correctamente`);
        navigate(basePath);
      } else {
        await createItem(processedData);
        toast.success(`${itemName} creado correctamente`);
        if (stay) {
          setTimeout(() => window.location.reload(), 500);
        } else {
          navigate(basePath);
        }
      }
    } catch (error) {
      console.error(`Error guardando ${itemName}:`, error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Error al guardar';
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey) {
            const firstError = errorData[firstKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        }
        toast.error(errorMessage);
      } else {
        toast.error('Error al guardar');
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const stay = submitAction.current === 'saveAndContinue';
    await performSave(data, stay);
  });

  const handleSave = () => {
    submitAction.current = 'save';
  };

  const handleSaveAndContinue = () => {
    submitAction.current = 'saveAndContinue';
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Está seguro de eliminar este ${itemName}?`)) {
      try {
        await deleteItem(params.id);
        toast.success(`${itemName} eliminado correctamente`);
        navigate(basePath);
      } catch (error) {
        console.error(`Error eliminando ${itemName}:`, error);
        toast.error(`Error al eliminar`);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-yellow-200 p-6">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-red-600 p-6">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
            </div>
            <div className="p-8">
              <form onSubmit={onSubmit} className="space-y-6">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {field.label}
                    </label>

                    {field.type === 'autoselect' ? (
                      field.loadOptions ? (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={{ required: field.required }}
                          render={({ field: { onChange, value } }) => (
                            <AsyncSelect
                              loadOptions={field.loadOptions}
                              defaultOptions
                              placeholder={field.placeholder || "Buscar..."}
                              isClearable
                              isSearchable
                              noOptionsMessage={() => "No se encontraron resultados"}
                              onChange={(selected) => onChange(selected ? selected : null)}
                              value={value}
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.label}
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                      ) : (
                        <Controller
                          name={field.name}
                          control={control}
                          rules={{ required: field.required }}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              options={field.options}
                              placeholder={field.placeholder || "Buscar..."}
                              isClearable
                              isSearchable
                              noOptionsMessage={() => "No se encontraron resultados"}
                              onChange={(selected) => onChange(selected ? selected.value : null)}
                              value={field.options?.find(opt => opt.value === value) || null}
                              classNamePrefix="react-select"
                            />
                          )}
                        />
                      )
                    ) : field.type === 'multiautoselect' ? (
                      <Controller
                        name={field.name}
                        control={control}
                        rules={{ required: field.required }}
                        render={({ field: { onChange, value } }) => (
                          <AsyncSelect
                            isMulti
                            loadOptions={field.loadOptions}
                            defaultOptions
                            placeholder={field.placeholder || "Buscar..."}
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No se encontraron resultados"}
                            onChange={(selected) => onChange(selected || [])}
                            value={value || []}
                            getOptionValue={(option) => option.value}
                            getOptionLabel={(option) => option.label}
                            classNamePrefix="react-select"
                          />
                        )}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        {...register(field.name, { required: field.required })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        {...register(field.name, { required: field.required })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="4"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        step={field.step || (field.type === 'number' ? 'any' : undefined)}
                        {...register(field.name, { required: field.required })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    )}

                    {errors[field.name] && (
                      <span className="text-red-600 text-sm mt-1">Este campo es requerido</span>
                    )}
                  </div>
                ))}

                {children}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(basePath)}
                    className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <div className="space-x-3">
                    {isEditing && typeof deleteItem === 'function' && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                    {isEditing ? (
                      <button
                        type="submit"
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 text-white rounded-lg hover:from-yellow-700 hover:to-red-700 transition-all"
                      >
                        Actualizar
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          onClick={handleSave}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-red-600 text-white rounded-lg hover:from-yellow-700 hover:to-red-700 transition-all"
                        >
                          Guardar
                        </button>
                        <button
                          type="submit"
                          onClick={handleSaveAndContinue}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Guardar y seguir creando
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}