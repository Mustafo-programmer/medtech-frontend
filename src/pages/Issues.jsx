import { useQuery } from '@tanstack/react-query';
import { issuesAPI } from '../api';
import { EmptyState, Badge } from '../components/Notify';
import { useNavigate } from 'react-router-dom';

const SEV_COLOR  = { low:'green', medium:'yellow', high:'default', critical:'red' };
const SEV_MAP    = { low:'Низкая', medium:'Средняя', high:'Высокая', critical:'Критическая' };
const ISSUE_STATUS = { open:'Открыта', in_progress:'В работе', resolved:'Решена' };
const ISSUE_COLOR  = { open:'red', in_progress:'yellow', resolved:'green' };

export default function Issues() {
  const navigate = useNavigate();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues-all'],
    queryFn: () => issuesAPI.getAllGlobal().then(r => r.data),
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day:'2-digit', month:'2-digit', year:'numeric'
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Все проблемы</h1>
        <span className="text-sm text-[#8b90a8]">{issues.length} записей</span>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#8b90a8]">Загрузка...</div>
      ) : issues.length === 0 ? (
        <EmptyState icon="✅" text="Проблем не зафиксировано" />
      ) : (
        <div className="flex flex-col gap-3">
          {issues.map(issue => (
            <div key={issue._id} className="bg-[#1a1d27] border border-[#2e3248] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="font-semibold text-[#e8eaf0]">{issue.problem}</span>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <Badge color={SEV_COLOR[issue.severity]}>{SEV_MAP[issue.severity]}</Badge>
                  <Badge color={ISSUE_COLOR[issue.status]}>{ISSUE_STATUS[issue.status]}</Badge>
                </div>
              </div>
              {issue.cause && (
                <p className="text-sm text-[#8b90a8] mb-2">
                  <strong className="text-[#e8eaf0]">Причина:</strong> {issue.cause}
                </p>
              )}
              {issue.solution && (
                <p className="text-sm text-[#8b90a8] mb-3">
                  <strong className="text-green-400">Решение:</strong> {issue.solution}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-[#2e3248]">
                <span className="text-xs text-[#8b90a8]">{formatDate(issue.createdAt)}</span>
                {issue.equipment && (
                  <button
                    onClick={() => navigate(`/equipment/${issue.equipment}`)}
                    className="text-xs text-[#4f7cff] hover:underline"
                  >
                    Перейти к оборудованию →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}