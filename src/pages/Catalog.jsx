import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentAPI, categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { notify, Button, EmptyState, Badge } from '../components/Notify';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Notify';
import ImageUpload from '../components/ImageUpload';
import { Search, Plus } from 'lucide-react';

const STATUS_MAP   = { active:'Активен', maintenance:'Обслуживание', retired:'Списан' };
const STATUS_COLOR = { active:'green', maintenance:'yellow', retired:'red' };

const DEFAULT_CATEGORIES = [
  { name:'ECG',       label:'ЭКГ' },
  { name:'EEG',       label:'ЭЭГ' },
  { name:'Ultrasound',label:'УЗИ' },
  { name:'MRI',       label:'МРТ' },
  { name:'CT',        label:'КТ' },
  { name:'Xray',      label:'Рентген' },
  { name:'Lab',       label:'Лаборатория' },
  { name:'Other',     label:'Другое' },
];

const EMPTY_FORM = {
  name:'', category:'ECG', manufacturer:'', model:'',
  year:'', serialNumber:'', status:'active', description:'', image:''
};

export default function Catalog() {
  const { isEditor } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment', search, category],
    queryFn: () => equipmentAPI.getAll({ search, category }).then(r => r.data),
  });

  // Загружаем пользовательские категории
  const { data: customCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data),
  });

  // Объединяем дефолтные + пользовательские
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map(c => ({ name: c.name, label: c.label, icon: c.icon }))
  ];

  const getCatLabel = (name) => {
    const found = allCategories.find(c => c.name === name);
    return found ? found.label : name;
  };

  const createMutation = useMutation({
    mutationFn: (data) => equipmentAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['equipment']);
      setModal(false);
      notify.success('Оборудование добавлено');
      setForm(EMPTY_FORM);
    },
    onError: (err) => notify.error(err.response?.data?.message || 'Ошибка'),
  });

  const handleCreate = () => {
    if (!form.name) { notify.error('Введите название'); return; }
    createMutation.mutate(form);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Каталог оборудования</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b90a8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 bg-[#1a1d27] border border-[#2e3248] rounded-lg text-sm text-[#e8eaf0] outline-none focus:border-[#4f7cff] w-48 transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 bg-[#1a1d27] border border-[#2e3248] rounded-lg text-sm text-[#e8eaf0] outline-none cursor-pointer"
          >
            <option value="">Все категории</option>
            {allCategories.map(c => (
              <option key={c.name} value={c.name}>{c.label}</option>
            ))}
          </select>
          {isEditor && (
            <Button onClick={() => setModal(true)}>
              <Plus size={14} className="inline mr-1" /> Добавить
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-[#8b90a8]">Загрузка...</div>
      ) : equipment.length === 0 ? (
        <EmptyState icon="🖥" text="Оборудование не найдено" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipment.map(eq => (
            <div
              key={eq._id}
              onClick={() => navigate(`/equipment/${eq._id}`)}
              className="bg-[#1a1d27] border border-[#2e3248] rounded-xl overflow-hidden cursor-pointer hover:border-[#4f7cff] hover:-translate-y-0.5 transition-all duration-200"
            >
              {eq.image ? (
                <img src={eq.image} alt={eq.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-[#222534] flex items-center justify-center text-4xl">
                  🖥
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge color="blue">{getCatLabel(eq.category)}</Badge>
                  <Badge color={STATUS_COLOR[eq.status]}>{STATUS_MAP[eq.status]}</Badge>
                </div>
                <div className="font-semibold text-[#e8eaf0] mb-1">{eq.name}</div>
                <div className="text-sm text-[#8b90a8]">{eq.manufacturer || '—'}</div>
                <div className="text-xs text-[#8b90a8] mt-1">
                  {eq.model} {eq.year ? `· ${eq.year}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title="Добавить оборудование" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({...form, image: url})}
            />
            <Input label="Название *" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Название оборудования" />
            <Select label="Категория" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
              {allCategories.map(c => (
                <option key={c.name} value={c.name}>{c.label}</option>
              ))}
            </Select>
            <Input label="Производитель" value={form.manufacturer} onChange={e => setForm({...form, manufacturer:e.target.value})} placeholder="Производитель" />
            <Input label="Модель" value={form.model} onChange={e => setForm({...form, model:e.target.value})} placeholder="Модель" />
            <Input label="Год" type="number" value={form.year} onChange={e => setForm({...form, year:e.target.value})} placeholder="Год выпуска" />
            <Input label="Серийный номер" value={form.serialNumber} onChange={e => setForm({...form, serialNumber:e.target.value})} placeholder="Серийный номер" />
            <Select label="Статус" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
              <option value="active">Активен</option>
              <option value="maintenance">Обслуживание</option>
              <option value="retired">Списан</option>
            </Select>
            <Textarea label="Описание" value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Описание оборудования" />
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full mt-2">
              {createMutation.isPending ? 'Сохраняем...' : 'Добавить'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}