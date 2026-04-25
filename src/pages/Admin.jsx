import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, categoriesAPI, onlineAPI } from '../api';
import { notify, Button, EmptyState } from '../components/Notify';
import { Input } from '../components/Notify';
import { Download, Trash2, Plus, Circle, AlertTriangle, Clock } from 'lucide-react';

export default function Admin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('dashboard');
  const [catForm, setCatForm] = useState({ name:'', label:'', icon:'🖥', color:'#4f7cff' });
  const [sForm, setSForm] = useState(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats().then(r => r.data),
  });

  const { data: logsData } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => adminAPI.getLogs().then(r => r.data),
  });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminAPI.getSettings().then(r => r.data),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data),
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['online-users'],
    queryFn: () => onlineAPI.getAll().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: maintenance } = useQuery({
    queryKey: ['admin-maintenance'],
    queryFn: () => adminAPI.getMaintenance().then(r => r.data),
  });

  const maintenanceCount = (maintenance?.overdue?.length || 0) + (maintenance?.upcoming?.length || 0);

  const clearLogs = useMutation({
    mutationFn: () => adminAPI.clearLogs(),
    onSuccess: () => { qc.invalidateQueries(['admin-logs']); notify.success('Логи очищены'); },
  });

  const saveSettings = useMutation({
    mutationFn: (data) => adminAPI.saveSettings(data),
    onSuccess: () => notify.success('Настройки сохранены'),
    onError: () => notify.error('Ошибка'),
  });

  const createCategory = useMutation({
    mutationFn: (data) => categoriesAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['categories']);
      notify.success('Категория добавлена');
      setCatForm({ name:'', label:'', icon:'🖥', color:'#4f7cff' });
    },
    onError: (err) => notify.error(err.response?.data?.message || 'Ошибка'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['categories']); notify.success('Категория удалена'); },
    onError: () => notify.error('Ошибка'),
  });

  const handleExport = async () => {
    try {
      const res = await adminAPI.export();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medtech-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify.success('Экспорт завершён');
    } catch { notify.error('Ошибка экспорта'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  const formatDateShort = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day:'2-digit', month:'2-digit', year:'numeric'
  });

  const daysUntil = (d) => {
    const diff = new Date(d) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const LOG_COLORS = {
    CREATE: 'bg-green-500/10 text-green-400',
    UPDATE: 'bg-blue-500/10 text-blue-400',
    DELETE: 'bg-red-500/10 text-red-400',
    LOGIN:  'bg-yellow-500/10 text-yellow-400',
  };

  const tabs = [
    { key:'dashboard',   label:'📊 Дашборд' },
    { key:'maintenance', label:`🔔 Обслуживание${maintenanceCount > 0 ? ` (${maintenanceCount})` : ''}` },
    { key:'online',      label:`🟢 Онлайн (${onlineUsers.length})` },
    { key:'categories',  label:'🏷 Категории' },
    { key:'logs',        label:'📋 Логи' },
    { key:'settings',    label:'⚙ Настройки' },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Админ панель</h1>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={14} className="inline mr-1" /> Экспорт данных
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2e3248] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-all whitespace-nowrap ${
              tab === t.key
                ? 'border-[#4f7cff] text-[#4f7cff]'
                : 'border-transparent text-[#8b90a8] hover:text-[#e8eaf0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label:'Оборудование',    value: stats.equipment,     color:'text-[#4f7cff]' },
              { label:'Пользователи',    value: stats.users,         color:'text-[#4f7cff]' },
              { label:'Открытых проблем',value: stats.openIssues,    color:'text-red-400' },
              { label:'Решено проблем',  value: stats.resolvedIssues,color:'text-green-400' },
              { label:'Файлов',          value: stats.files,         color:'text-[#4f7cff]' },
              { label:'Комментариев',    value: stats.comments,      color:'text-[#4f7cff]' },
            ].map(s => (
              <div key={s.label} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5 text-center">
                <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[#8b90a8]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Maintenance alert на дашборде */}
          {maintenanceCount > 0 && (
            <div
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 cursor-pointer hover:bg-yellow-500/15 transition-all"
              onClick={() => setTab('maintenance')}
            >
              <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-yellow-400">
                  Требует внимания: {maintenanceCount} единиц оборудования
                </div>
                <div className="text-xs text-[#8b90a8] mt-0.5">
                  {maintenance?.overdue?.length > 0 && `${maintenance.overdue.length} просрочено · `}
                  {maintenance?.upcoming?.length > 0 && `${maintenance.upcoming.length} в ближайшие 30 дней`}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
              <h4 className="text-sm text-[#8b90a8] mb-4">По категориям</h4>
              {stats.byCategory.map(c => {
                const max = Math.max(...stats.byCategory.map(x => x.count), 1);
                return (
                  <div key={c._id} className="flex items-center gap-3 mb-3">
                    <span className="text-xs w-20 text-[#8b90a8]">{c._id}</span>
                    <div className="flex-1 h-2 bg-[#222534] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4f7cff] rounded-full" style={{width:`${c.count/max*100}%`}} />
                    </div>
                    <span className="text-xs text-[#8b90a8] w-4">{c.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
              <h4 className="text-sm text-[#8b90a8] mb-4">По статусу</h4>
              {stats.byStatus.map(c => {
                const max = Math.max(...stats.byStatus.map(x => x.count), 1);
                const color = c._id==='active' ? '#2ecc71' : c._id==='maintenance' ? '#f39c12' : '#e74c3c';
                const label = c._id==='active' ? 'Активен' : c._id==='maintenance' ? 'Обслуживание' : 'Списан';
                return (
                  <div key={c._id} className="flex items-center gap-3 mb-3">
                    <span className="text-xs w-24 text-[#8b90a8]">{label}</span>
                    <div className="flex-1 h-2 bg-[#222534] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${c.count/max*100}%`, background:color}} />
                    </div>
                    <span className="text-xs text-[#8b90a8] w-4">{c.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAINTENANCE */}
      {tab === 'maintenance' && (
        <div>
          {/* Просрочено */}
          {maintenance?.overdue?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-400" />
                <h3 className="text-sm font-semibold text-red-400">Просрочено ({maintenance.overdue.length})</h3>
              </div>
              <div className="flex flex-col gap-3">
                {maintenance.overdue.map(eq => (
                  <div
                    key={eq._id}
                    className="flex items-center justify-between bg-[#1a1d27] border border-red-500/30 rounded-xl px-5 py-4 cursor-pointer hover:border-red-500/50 transition-all"
                    onClick={() => window.location.href = `/equipment/${eq._id}`}
                  >
                    <div>
                      <div className="font-medium text-sm text-[#e8eaf0]">{eq.name}</div>
                      <div className="text-xs text-[#8b90a8] mt-0.5">
                        {eq.manufacturer} {eq.model} · {eq.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-red-400 font-medium">
                        Просрочено на {Math.abs(daysUntil(eq.nextMaintenance))} дн.
                      </div>
                      <div className="text-xs text-[#8b90a8] mt-0.5">
                        {formatDateShort(eq.nextMaintenance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Скоро */}
          {maintenance?.upcoming?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-400">В ближайшие 30 дней ({maintenance.upcoming.length})</h3>
              </div>
              <div className="flex flex-col gap-3">
                {maintenance.upcoming.map(eq => (
                  <div
                    key={eq._id}
                    className="flex items-center justify-between bg-[#1a1d27] border border-yellow-500/30 rounded-xl px-5 py-4 cursor-pointer hover:border-yellow-500/50 transition-all"
                    onClick={() => window.location.href = `/equipment/${eq._id}`}
                  >
                    <div>
                      <div className="font-medium text-sm text-[#e8eaf0]">{eq.name}</div>
                      <div className="text-xs text-[#8b90a8] mt-0.5">
                        {eq.manufacturer} {eq.model} · {eq.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-yellow-400 font-medium">
                        Через {daysUntil(eq.nextMaintenance)} дн.
                      </div>
                      <div className="text-xs text-[#8b90a8] mt-0.5">
                        {formatDateShort(eq.nextMaintenance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {maintenanceCount === 0 && (
            <EmptyState icon="✅" text="Всё оборудование обслуживается вовремя" />
          )}

          <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-4 mt-4">
            <p className="text-xs text-[#8b90a8]">
              💡 Чтобы установить дату обслуживания — откройте карточку оборудования и нажмите «Редактировать»
            </p>
          </div>
        </div>
      )}

      {/* ONLINE */}
      {tab === 'online' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Circle size={10} className="text-green-400 fill-green-400" />
            <span className="text-sm text-[#8b90a8]">Активны последние 2 минуты</span>
          </div>
          {onlineUsers.length === 0 ? (
            <EmptyState icon="👤" text="Никого нет онлайн" />
          ) : (
            <div className="flex flex-col gap-3">
              {onlineUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between bg-[#1a1d27] border border-[#2e3248] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#222534] flex items-center justify-center text-sm font-semibold text-[#4f7cff]">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1a1d27]" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{u.name}</div>
                      <div className="text-xs text-[#8b90a8]">{u.role}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#8b90a8]">{formatDate(u.lastSeen)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES */}
      {tab === 'categories' && (
        <div>
          <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5 mb-6">
            <h4 className="font-medium text-sm mb-4">Добавить категорию</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="Системное имя (латиница) *" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="Например: Endoscopy" />
              <Input label="Отображаемое название *" value={catForm.label} onChange={e => setCatForm({...catForm, label: e.target.value})} placeholder="Например: Эндоскопия" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input label="Иконка (эмодзи)" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} placeholder="🖥" />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#8b90a8]">Цвет</label>
                <input type="color" value={catForm.color} onChange={e => setCatForm({...catForm, color: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-[#222534] border border-[#2e3248]" />
              </div>
            </div>
            <Button onClick={() => {
              if (!catForm.name || !catForm.label) { notify.error('Заполните обязательные поля'); return; }
              createCategory.mutate(catForm);
            }}>
              <Plus size={14} className="inline mr-1" /> Добавить
            </Button>
          </div>
          {categories.length === 0 ? (
            <EmptyState icon="🏷" text="Пользовательских категорий нет" />
          ) : (
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <div key={cat._id} className="flex items-center justify-between bg-[#1a1d27] border border-[#2e3248] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{cat.label}</div>
                      <div className="text-xs text-[#8b90a8]">{cat.name}</div>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{background: cat.color}} />
                  </div>
                  <Button variant="danger" onClick={() => {
                    if (window.confirm('Удалить категорию?')) deleteCategory.mutate(cat._id);
                  }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOGS */}
      {tab === 'logs' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button variant="danger" onClick={() => {
              if (window.confirm('Очистить все логи?')) clearLogs.mutate();
            }}>
              <Trash2 size={14} className="inline mr-1" /> Очистить
            </Button>
          </div>
          {!logsData?.logs?.length ? (
            <EmptyState icon="📋" text="Логи пусты" />
          ) : (
            <div className="flex flex-col gap-2">
              {logsData.logs.map(l => (
                <div key={l._id} className="flex items-center gap-3 bg-[#1a1d27] border border-[#2e3248] rounded-xl px-4 py-3 text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${LOG_COLORS[l.action] || 'bg-[#222534] text-[#8b90a8]'}`}>
                    {l.action}
                  </span>
                  <span className="flex-1 text-[#8b90a8]">
                    <span className="text-[#e8eaf0] font-medium">{l.user?.name || 'Система'}</span>
                    {l.entity && ` · ${l.entity}`}
                    {l.detail && ` · ${l.detail}`}
                  </span>
                  <span className="text-xs text-[#8b90a8] flex-shrink-0">{formatDate(l.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && settings && (
        <div className="max-w-md">
          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5 flex flex-col gap-4">
              <h4 className="font-medium text-sm">Общие настройки</h4>
              <Input label="Название сайта" defaultValue={settings.siteName} onChange={e => setSForm({...(sForm || settings), siteName: e.target.value})} />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#8b90a8]">Язык по умолчанию</label>
                <select defaultValue={settings.defaultLanguage} onChange={e => setSForm({...(sForm || settings), defaultLanguage: e.target.value})} className="w-full px-3 py-2.5 bg-[#222534] border border-[#2e3248] rounded-lg text-[#e8eaf0] text-sm outline-none">
                  <option value="ru">Русский</option>
                  <option value="uz">Узбекский</option>
                  <option value="en">English</option>
                </select>
              </div>
              <Input label="Макс. пользователей" type="number" defaultValue={settings.maxUsersAllowed} onChange={e => setSForm({...(sForm || settings), maxUsersAllowed: Number(e.target.value)})} />
            </div>
            <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5 flex flex-col gap-4">
              <h4 className="font-medium text-sm">Разрешения</h4>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#8b90a8]">Разрешить комментарии</label>
                <input type="checkbox" defaultChecked={settings.allowComments} onChange={e => setSForm({...(sForm || settings), allowComments: e.target.checked})} className="w-4 h-4 cursor-pointer accent-[#4f7cff]" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-[#8b90a8]">Viewer может открывать файлы</label>
                <input type="checkbox" defaultChecked={settings.allowViewerDownload} onChange={e => setSForm({...(sForm || settings), allowViewerDownload: e.target.checked})} className="w-4 h-4 cursor-pointer accent-[#4f7cff]" />
              </div>
            </div>
            <Button onClick={() => saveSettings.mutate(sForm || settings)} className="w-full">
              {saveSettings.isPending ? 'Сохраняем...' : 'Сохранить настройки'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}