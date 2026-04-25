import toast from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  loading: (msg) => toast.loading(msg),
};

// Переиспользуемые компоненты UI
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-[#8b90a8]">{label}</label>}
      <input
        className="w-full px-3 py-2.5 bg-[#222534] border border-[#2e3248] rounded-lg text-[#e8eaf0] text-sm outline-none focus:border-[#4f7cff] transition-colors"
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-[#8b90a8]">{label}</label>}
      <select
        className="w-full px-3 py-2.5 bg-[#222534] border border-[#2e3248] rounded-lg text-[#e8eaf0] text-sm outline-none focus:border-[#4f7cff] transition-colors cursor-pointer"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-[#8b90a8]">{label}</label>}
      <textarea
        className="w-full px-3 py-2.5 bg-[#222534] border border-[#2e3248] rounded-lg text-[#e8eaf0] text-sm outline-none focus:border-[#4f7cff] transition-colors resize-y min-h-[80px]"
        {...props}
      />
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:   'bg-[#4f7cff] hover:bg-[#3d6aee] text-white',
    secondary: 'bg-[#222534] border border-[#2e3248] text-[#e8eaf0] hover:border-[#4f7cff]',
    danger:    'border border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
    ghost:     'text-[#8b90a8] hover:text-[#e8eaf0] hover:bg-[#222534]',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#8b90a8]">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function Badge({ children, color = 'default' }) {
  const colors = {
    default: 'bg-[#222534] text-[#8b90a8] border-[#2e3248]',
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500',
    green:   'bg-green-500/10 text-green-400 border-green-500',
    yellow:  'bg-yellow-500/10 text-yellow-400 border-yellow-500',
    red:     'bg-red-500/10 text-red-400 border-red-500',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}