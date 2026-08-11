import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 pt-2" dir="rtl">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">الإعدادات ⚙️</h1>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-right">
        <h3 className="font-bold text-gray-800 text-sm mb-4">بيانات الحساب الشخصي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-bold">الاسم</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-bold">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-right">
        <h3 className="font-bold text-gray-800 text-sm mb-4">التفضيلات والتنبيهات</h3>
        <div className="flex justify-between items-center py-2 border-b border-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-700">إشعارات البريد الإلكتروني</p>
            <p className="text-[10px] text-gray-400">استلام تقارير الذكاء الاصطناعي اليومية على الإيميل</p>
          </div>
          <input 
            type="checkbox" 
            checked={notifications} 
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer" 
          />
        </div>
      </div>

      <div className="text-right">
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer">
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
};

export default Settings;
