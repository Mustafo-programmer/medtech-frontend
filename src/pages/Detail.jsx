import { useState } from 'react';
import QRModal from '../components/QRModal';
import PrintCard from '../components/PrintCard';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentAPI, filesAPI, issuesAPI, commentsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { notify, Button, EmptyState, Badge } from '../components/Notify';
import { Input, Select, Textarea } from '../components/Notify';
import Modal from '../components/Modal';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, Paperclip, AlertTriangle, MessageSquare, Trash2, ExternalLink, Pencil, History } from 'lucide-react';
const STATUS_MAP   = { active:'Активен', maintenance:'Обслуживание', retired:'Списан' };
const STATUS_COLOR = { active:'green', maintenance:'yellow', retired:'red' };
const SEV_COLOR    = { low:'green', medium:'yellow', high:'default', critical:'red' };
const SEV_MAP      = { low:'Низкая', medium:'Средняя', high:'Высокая', critical:'Критическая' };
const ISSUE_STATUS = { open:'Открыта', in_progress:'В работе', resolved:'Решена' };
const ISSUE_COLOR  = { open:'red', in_progress:'yellow', resolved:'green' };
const FILE_TYPES   = { manual:'Инструкция', service:'Сервисное руководство', training:'Обучение', certificate:'Сертификат', other:'Другое' };
const CATEGORIES   = ['ECG','EEG','Ultrasound','MRI','CT','Xray','Lab','Other'];

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isEditor } = useAuth();
  const qc = useQueryClient();

  const [tab, setTab]           = useState('files');
  const [fileModal, setFileModal]   = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [editModal, setEditModal]   = useState(false);
  const [comment, setComment]   = useState('');

  const [fileForm, setFileForm]   = useState({ name:'', type:'manual', url:'' });
  const [issueForm, setIssueForm] = useState({ problem:'', cause:'', solution:'', severity:'medium' });
  const [editForm, setEditForm]   = useState(null);
  const [qrModal, setQrModal] = useState(false);


  const { data: eq, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentAPI.getOne(id).then(r => r.data),
  });

  const { data: files = [] } = useQuery({
    queryKey: ['files', id],
    queryFn: () => filesAPI.getAll(id).then(r => r.data),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', id],
    queryFn: () => issuesAPI.getAll(id).then(r => r.data),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsAPI.getAll(id).then(r => r.data),
  });
  const { data: equipmentHistory = [] } = useQuery({
    queryKey: ['history', id],
    queryFn: () => equipmentAPI.getHistory(id).then(r => r.data),
  });

  console.log('EQUIPMENT HISTORY:', equipmentHistory);

  const deleteEq = useMutation({
    mutationFn: () => equipmentAPI.delete(id),
    onSuccess: () => { notify.success('Удалено'); navigate('/'); },
    onError: () => notify.error('Ошибка удаления'),
  });

  const updateEq = useMutation({
    mutationFn: (data) => equipmentAPI.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['equipment', id]);
      setEditModal(false);
      notify.success('Сохранено');
    },
    onError: () => notify.error('Ошибка'),
  });

  const addFile = useMutation({
    mutationFn: (data) => filesAPI.create({ ...data, equipment: id }),
    onSuccess: () => {
      qc.invalidateQueries(['files', id]);
      setFileModal(false);
      notify.success('Файл добавлен');
      setFileForm({ name:'', type:'manual', url:'' });
    },
    onError: () => notify.error('Ошибка'),
  });

  const deleteFile = useMutation({
    mutationFn: (fid) => filesAPI.delete(fid),
    onSuccess: () => { qc.invalidateQueries(['files', id]); notify.success('Файл удалён'); },
  });

  const addIssue = useMutation({
    mutationFn: (data) => issuesAPI.create({ ...data, equipment: id }),
    onSuccess: () => {
      qc.invalidateQueries(['issues', id]);
      setIssueModal(false);
      notify.success('Проблема добавлена');
      setIssueForm({ problem:'', cause:'', solution:'', severity:'medium' });
    },
    onError: () => notify.error('Ошибка'),
  });

  const addComment = useMutation({
    mutationFn: () => commentsAPI.create({ text: comment, equipment: id }),
    onSuccess: () => {
      qc.invalidateQueries(['comments', id]);
      setComment('');
      notify.success('Комментарий добавлен');
    },
    onError: () => notify.error('Ошибка'),
  });

  const openEdit = () => {
    setEditForm({
      name:            eq.name,
      category:        eq.category,
      manufacturer:    eq.manufacturer || '',
      model:           eq.model || '',
      year:            eq.year || '',
      serialNumber:    eq.serialNumber || '',
      status:          eq.status,
      description:     eq.description || '',
      image:           eq.image || '',
      // ← ДОБАВЬ ЭТО:
      nextMaintenance: eq.nextMaintenance ? eq.nextMaintenance.split('T')[0] : '',
    });
    setEditModal(true);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  if (isLoading) return <div className="text-center py-20 text-[#8b90a8]">Загрузка...</div>;
  if (!eq) return <div className="text-center py-20 text-[#8b90a8]">Не найдено</div>;

  const tabs = [
    { key:'files',    label:'Файлы',       count: files.length,    icon:<Paperclip size={14}/> },
    { key:'issues',   label:'Проблемы',    count: issues.length,   icon:<AlertTriangle size={14}/> },
    { key:'comments', label:'Комментарии', count: comments.length, icon:<MessageSquare size={14}/> },
    { key:'history', label:'История', count: equipmentHistory.length, icon:<History size={14}/> },  ];

  return (
    <div className="max-w-4xl">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-2 text-sm text-[#8b90a8] hover:text-[#e8eaf0] transition-colors"
    >
      <ArrowLeft size={16} /> Назад
    </button>
    <div className="flex gap-2">
      {isEditor && (
        <Button variant="secondary" onClick={openEdit}>
          <Pencil size={14} className="inline mr-1" /> Редактировать
        </Button>
      )}
      <Button variant="secondary" onClick={() => setQrModal(true)}>
        QR код
      </Button>
      <PrintCard eq={eq} files={files} issues={issues} />
      {isAdmin && (
        <Button variant="danger" onClick={() => {
          if (window.confirm('Удалить оборудование?')) deleteEq.mutate();
        }}>
          <Trash2 size={14} className="inline mr-1" /> Удалить
        </Button>
      )}
    </div>
  </div>
      {/* Info card */}
      <div className="bg-[#1a1d27] border border-[#2e3248] rounded-xl overflow-hidden mb-6">
        {/* Фото */}
        {eq.image ? (
          <img src={eq.image} alt={eq.name} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-40 bg-[#222534] flex items-center justify-center text-6xl">
            🖥
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#e8eaf0]">{eq.name}</h1>
            <Badge color={STATUS_COLOR[eq.status]}>{STATUS_MAP[eq.status]}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {[
              ['Категория',     eq.category],
              ['След. обслуживание', eq.nextMaintenance
  ? new Date(eq.nextMaintenance).toLocaleDateString('ru-RU')
  : '—'
],
              ['Производитель', eq.manufacturer || '—'],
              ['Модель',        eq.model || '—'],
              ['Год',           eq.year || '—'],
              ['Серийный №',    eq.serialNumber || '—'],
              ['Добавил',       eq.createdBy?.name || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-[#8b90a8] mb-1">{label}</div>
                <div className="text-sm text-[#e8eaf0]">{value}</div>
              </div>
            ))}
          </div>
          {eq.description && (
            <p className="text-sm text-[#8b90a8] leading-relaxed border-t border-[#2e3248] pt-4">
              {eq.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2e3248] mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-all ${
              tab === t.key
                ? 'border-[#4f7cff] text-[#4f7cff]'
                : 'border-transparent text-[#8b90a8] hover:text-[#e8eaf0]'
            }`}
          >
            {t.icon} {t.label}
            <span className="text-xs bg-[#222534] px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* FILES TAB */}
      {tab === 'files' && (
        <div>
          {isEditor && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setFileModal(true)}>
                <Paperclip size={14} className="inline mr-1" /> Добавить файл
              </Button>
            </div>
          )}
          {files.length === 0 ? <EmptyState icon="📎" text="Файлы не добавлены" /> : (
            <div className="flex flex-col gap-3">
              {files.map(f => (
                <div key={f._id} className="flex items-center justify-between bg-[#1a1d27] border border-[#2e3248] rounded-xl px-5 py-4">
                  <div>
                    <div className="font-medium text-sm">{f.name}</div>
                    <div className="text-xs text-[#8b90a8] mt-0.5">{FILE_TYPES[f.type] || f.type}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={f.url} target="_blank" rel="noreferrer">
                      <Button variant="secondary"><ExternalLink size={14} className="inline mr-1" /> Открыть</Button>
                    </a>
                    {isEditor && (
                      <Button variant="danger" onClick={() => deleteFile.mutate(f._id)}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ISSUES TAB */}
      {tab === 'issues' && (
        <div>
          {isEditor && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIssueModal(true)}>
                <AlertTriangle size={14} className="inline mr-1" /> Добавить проблему
              </Button>
            </div>
          )}
          {issues.length === 0 ? <EmptyState icon="✅" text="Проблем не зафиксировано" /> : (
            <div className="flex flex-col gap-3">
              {issues.map(issue => (
                <div key={issue._id} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-[#e8eaf0]">{issue.problem}</span>
                    <div className="flex gap-2">
                      <Badge color={SEV_COLOR[issue.severity]}>{SEV_MAP[issue.severity]}</Badge>
                      <Badge color={ISSUE_COLOR[issue.status]}>{ISSUE_STATUS[issue.status]}</Badge>
                    </div>
                  </div>
                  {issue.cause    && <p className="text-sm text-[#8b90a8] mb-2"><strong className="text-[#e8eaf0]">Причина:</strong> {issue.cause}</p>}
                  {issue.solution && <p className="text-sm text-[#8b90a8]"><strong className="text-green-400">Решение:</strong> {issue.solution}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMMENTS TAB */}
      {tab === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <div className="text-sm text-[#8b90a8] mb-4">Комментариев пока нет</div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {comments.map(c => (
                <div key={c._id} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">{c.author?.name}</span>
                    <span className="text-xs text-[#8b90a8]">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#8b90a8]">{c.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && comment.trim() && addComment.mutate()}
              placeholder="Написать комментарий..."
              className="flex-1 px-4 py-2.5 bg-[#1a1d27] border border-[#2e3248] rounded-xl text-sm text-[#e8eaf0] outline-none focus:border-[#4f7cff] transition-colors"
            />
            <Button onClick={() => comment.trim() && addComment.mutate()}>Отправить</Button>
          </div>
        </div>
      )}
      {/* HISTORY TAB */}
{tab === 'history' && (
  <div>
    {equipmentHistory.length === 0 ? (
      <EmptyState icon="📝" text="Изменений пока нет" />
    ) : (
      <div className="flex flex-col gap-3">
        {equipmentHistory.map(h => (
          <div key={h._id} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">

            {/* TYPE (CREATE / UPDATE / DELETE) */}
            <div className="text-xs font-bold text-[#4f7cff] mb-2">
              {h.action}
            </div>

            {/* USER + ENTITY */}
            <div className="text-sm text-[#e8eaf0] mb-1">
              {h.changedBy?.name} · equipment
              {h.changes?.[0]?.newValue ? ` · ${h.changes[0].newValue}` : ''}
            </div>

            {/* DATE */}
            <div className="text-xs text-[#8b90a8]">
              {formatDate(h.createdAt)}
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* EDIT MODAL */}
        {editModal && editForm && (
    <Modal title="Редактировать оборудование" onClose={() => setEditModal(false)}>
      <div className="flex flex-col gap-4">
        <ImageUpload value={editForm.image} onChange={(url) => setEditForm({...editForm, image: url})} />
        <Input label="Название *" value={editForm.name} onChange={e => setEditForm({...editForm, name:e.target.value})} />
        <Select label="Категория" value={editForm.category} onChange={e => setEditForm({...editForm, category:e.target.value})}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Производитель" value={editForm.manufacturer} onChange={e => setEditForm({...editForm, manufacturer:e.target.value})} />
        <Input label="Модель" value={editForm.model} onChange={e => setEditForm({...editForm, model:e.target.value})} />
        <Input label="Год" type="number" value={editForm.year} onChange={e => setEditForm({...editForm, year:e.target.value})} />
        <Input label="Серийный номер" value={editForm.serialNumber} onChange={e => setEditForm({...editForm, serialNumber:e.target.value})} />
        <Select label="Статус" value={editForm.status} onChange={e => setEditForm({...editForm, status:e.target.value})}>
          <option value="active">Активен</option>
          <option value="maintenance">Обслуживание</option>
          <option value="retired">Списан</option>
        </Select>
        <Textarea label="Описание" value={editForm.description} onChange={e => setEditForm({...editForm, description:e.target.value})} />

        {/* ← НОВОЕ ПОЛЕ */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#8b90a8]">Следующее обслуживание</label>
          <input
            type="date"
            value={editForm.nextMaintenance}
            onChange={e => setEditForm({...editForm, nextMaintenance: e.target.value})}
            className="w-full px-4 py-2.5 bg-[#222534] border border-[#2e3248] rounded-xl text-sm text-[#e8eaf0] outline-none focus:border-[#4f7cff] transition-colors"
          />
        </div>

        <Button onClick={() => updateEq.mutate(editForm)} className="w-full mt-2">
          {updateEq.isPending ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )}

      {/* FILE MODAL */}
      {fileModal && (
        <Modal title="Добавить файл" onClose={() => setFileModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Название *" value={fileForm.name} onChange={e => setFileForm({...fileForm, name:e.target.value})} placeholder="Инструкция по эксплуатации" />
            <Select label="Тип" value={fileForm.type} onChange={e => setFileForm({...fileForm, type:e.target.value})}>
              {Object.entries(FILE_TYPES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Input label="Ссылка (Google Drive) *" value={fileForm.url} onChange={e => setFileForm({...fileForm, url:e.target.value})} placeholder="https://drive.google.com/..." />
            <Button onClick={() => {
              if (!fileForm.name || !fileForm.url) { notify.error('Заполните все поля'); return; }
              addFile.mutate(fileForm);
            }} className="w-full mt-2">Добавить</Button>
          </div>
        </Modal>
      )}

      {/* ISSUE MODAL */}
      {issueModal && (
        <Modal title="Добавить проблему" onClose={() => setIssueModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Проблема *" value={issueForm.problem} onChange={e => setIssueForm({...issueForm, problem:e.target.value})} placeholder="Описание проблемы" />
            <Input label="Причина" value={issueForm.cause} onChange={e => setIssueForm({...issueForm, cause:e.target.value})} placeholder="Возможная причина" />
            <Textarea label="Решение" value={issueForm.solution} onChange={e => setIssueForm({...issueForm, solution:e.target.value})} placeholder="Как решить" />
            <Select label="Критичность" value={issueForm.severity} onChange={e => setIssueForm({...issueForm, severity:e.target.value})}>
              <option value="low">Низкая</option>
              <option value="medium">Средняя</option>
              <option value="high">Высокая</option>
              <option value="critical">Критическая</option>
            </Select>
            <Button onClick={() => {
              if (!issueForm.problem) { notify.error('Опишите проблему'); return; }
              addIssue.mutate(issueForm);
            }} className="w-full mt-2">Добавить</Button>
          </div>
        </Modal>
      )}
      {qrModal && (
  <QRModal equipment={eq} onClose={() => setQrModal(false)} />
)}
    </div>
  );
}