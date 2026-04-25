import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Monitor, AlertTriangle, Users, Settings, LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
      isActive
        ? 'bg-[#222534] text-[#4f7cff]'
        : 'text-[#8b90a8] hover:bg-[#222534] hover:text-[#e8eaf0]'
    }`;

  return (
    <aside className="w-56 flex flex-col flex-shrink-0 border-r border-[#2e3248] bg-[#1a1d27] p-3">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <span className="text-2xl">⚕</span>
        <span className="font-semibold text-[#e8eaf0]">MedTech</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <NavLink to="/" end className={navClass}>
          <Monitor size={16} /> Каталог
        </NavLink>
        <NavLink to="/issues" className={navClass}>
          <AlertTriangle size={16} /> Проблемы
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/users" className={navClass}>
              <Users size={16} /> Пользователи
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              <Settings size={16} /> Админ панель
            </NavLink>
          </>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-[#2e3248] pt-3 mt-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <div>
            <div className="text-sm font-medium text-[#e8eaf0]">{user?.name}</div>
            <div className="text-xs text-[#8b90a8]">{user?.role}</div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${
            user?.role === 'admin'  ? 'text-[#4f7cff] border-[#4f7cff]' :
            user?.role === 'editor' ? 'text-green-400 border-green-400' :
            'text-[#8b90a8] border-[#2e3248]'
          }`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#8b90a8] hover:text-red-400 hover:bg-[#222534] transition-all"
        >
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </aside>
  );
}