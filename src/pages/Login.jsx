import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../components/Notify';

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      notify.error('Введите логин и пароль');
      return;
    }
    setLoading(true);
    try {
      await login(form.login, form.password);
      navigate('/');
    } catch (err) {
      notify.error(err.message || err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0f1117'}}>
      <div className="w-full max-w-sm">
        <div className="bg-[#1a1d27] border border-[#2e3248] rounded-2xl p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">⚕</div>
            <h1 className="text-xl font-semibold text-[#e8eaf0]">MedTech Platform</h1>
            <p className="text-sm text-[#8b90a8] mt-1">Система управления медоборудованием</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Логин"
              value={form.login}
              onChange={e => setForm({...form, login: e.target.value})}
              className="w-full px-4 py-3 bg-[#222534] border border-[#2e3248] rounded-xl text-[#e8eaf0] text-sm outline-none focus:border-[#4f7cff] transition-colors"
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-3 bg-[#222534] border border-[#2e3248] rounded-xl text-[#e8eaf0] text-sm outline-none focus:border-[#4f7cff] transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4f7cff] hover:bg-[#3d6aee] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all mt-2"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}