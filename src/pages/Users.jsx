import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, adminAPI } from '../api';
import { notify, Button, EmptyState } from '../components/Notify';
import { Input, Select } from '../components/Notify';
import Modal from '../components/Modal';
import { Plus, Trash2, Lock, Unlock, KeyRound } from 'lucide-react';

export default function Users() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [pwModal, setPwModal] = useState(null); // { id, name }
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ name:'', login:'', password:'', role:'viewer', language:'ru' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getUsers().then(r => r.data),
  });

  const createUser = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: () => {
      qc.invalidateQueries(['users']);
      setModal(false);
      notify.success('Пользователь создан');
      setForm({ name:'', login:'', password:'', role:'viewer', language:'ru' });
    },
    onError: (err) => notify.error(err.response?.data?.message || 'Ошибка'),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => authAPI.updateRole(id, role),
    onSuccess: () => { qc.invalidateQueries(['users']); notify.success('Роль изменена'); },
    onError: () => notify.error('Ошибка'),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => authAPI.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries(['users']); notify.success('Пользователь удалён'); },
    onError: () => notify.error('Ошибка'),
  });

  const blockUser = useMutation({
    mutationFn: (id) => adminAPI.blockUser(id),
    onSuccess: () => { qc.invalidateQueries(['users']); notify.success('Статус изменён'); },
    onError: () => notify.error('Ошибка'),
  });

  const changePassword = useMutation({
    mutationFn: ({ id, password }) => adminAPI.changePassword(id, password),
    onSuccess: () => {
      setPwModal(null);
      setNewPassword('');
      notify.success('Пароль изменён');
    },
    onError: (err) => notify.error(err.response?.data?.message || 'Ошибка'),
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Пользователи</h1>
        <Button onClick={() => setModal(true)}>
          <Plus size={14} className="inline mr-1" /> Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#8b90a8]">Загрузка...</div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" text="Пользователей нет" />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map(u => (
            <div
              key={u._id}
              className={`flex items-center justify-between bg-[#1a1d27] border rounded-xl px-5 py-4 transition-all ${
                u.isBlocked ? 'border-red-500/30 opacity-60' : 'border-[#2e3248]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  u.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-[#222534] text-[#4f7cff]'
                }`}>
                  {u.isBlocked ? <Lock size={14} /> : u.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{u.name}</span>
                    {u.isBlocked && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                        Заблокирован
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8b90a8]">@{u.login}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={e => updateRole.mutate({ id: u._id, role: e.target.value })}
                  disabled={u.isBlocked}
                  className="px-3 py-1.5 bg-[#222534] border border-[#2e3248] rounded-lg text-sm text-[#e8eaf0] outline-none cursor-pointer disabled:opacity-40"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Смена пароля */}
                <button
                  title="Сменить пароль"
                  onClick={() => { setPwModal({ id: u._id, name: u.name }); setNewPassword(''); }}
                  className="p-2 rounded-lg bg-[#222534] hover:bg-[#2e3248] text-[#8b90a8] hover:text-[#e8eaf0] transition-all"
                >
                  <KeyRound size={14} />
                </button>

                {/* Блокировка */}
                {u.role !== 'admin' && (
                  <button
                    title={u.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                    onClick={() => blockUser.mutate(u._id)}
                    className={`p-2 rounded-lg transition-all ${
                      u.isBlocked
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-[#222534] text-[#8b90a8] hover:bg-red-500/10 hover:text-red-400'
                    }`}
                  >
                    {u.isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                  </button>
                )}

                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('Удалить пользователя?')) deleteUser.mutate(u._id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {modal && (
        <Modal title="Добавить пользователя" onClose={() => setModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Имя *" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Имя пользователя" />
            <Input label="Логин *" value={form.login} onChange={e => setForm({...form, login:e.target.value})} placeholder="Логин" />
            <Input label="Пароль *" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Минимум 6 символов" />
            <Select label="Роль" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
              <option value="viewer">Viewer — только просмотр</option>
              <option value="editor">Editor — редактирование</option>
              <option value="admin">Admin — полный доступ</option>
            </Select>
            <Select label="Язык" value={form.language} onChange={e => setForm({...form, language:e.target.value})}>
              <option value="ru">Русский</option>
              <option value="uz">Узбекский</option>
              <option value="en">English</option>
            </Select>
            <Button onClick={() => {
              if (!form.name || !form.login || !form.password) { notify.error('Заполните все поля'); return; }
              createUser.mutate(form);
            }} className="w-full mt-2">
              {createUser.isPending ? 'Создаём...' : 'Создать'}
            </Button>
          </div>
        </Modal>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {pwModal && (
        <Modal title={`Смена пароля — ${pwModal.name}`} onClose={() => setPwModal(null)}>
          <div className="flex flex-col gap-4">
            <Input
              label="Новый пароль *"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
            />
            <Button
              onClick={() => {
                if (newPassword.length < 6) { notify.error('Минимум 6 символов'); return; }
                changePassword.mutate({ id: pwModal.id, password: newPassword });
              }}
              className="w-full"
            >
              {changePassword.isPending ? 'Сохраняем...' : 'Сменить пароль'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}