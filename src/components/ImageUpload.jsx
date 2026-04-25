import { useState, useRef } from 'react';
import { uploadAPI } from '../api';
import { notify } from './Notify';
import { Camera, X } from 'lucide-react';

export default function ImageUpload({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const res = await uploadAPI.image(formData);
      onChange(res.data.url);
      notify.success('Фото загружено');
    } catch (err) {
      notify.error('Ошибка загрузки фото');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-[#8b90a8]">Фото оборудования</label>

      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#2e3248]">
          <img src={value} alt="equipment" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current.click()}
          className="w-full h-48 border-2 border-dashed border-[#2e3248] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#4f7cff] transition-colors"
        >
          {loading ? (
            <div className="text-sm text-[#8b90a8]">Загрузка...</div>
          ) : (
            <>
              <Camera size={32} className="text-[#8b90a8] mb-2" />
              <span className="text-sm text-[#8b90a8]">Нажмите чтобы загрузить фото</span>
              <span className="text-xs text-[#8b90a8] mt-1">JPG, PNG, WEBP до 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}