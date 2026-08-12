import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { contactService } from '../../services/contactService';
import type { ContactRequestDto } from '../../types';
import { Bell, Loader2, Check, X } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchContactRequests = async () => {
    setIsLoading(true);
    try {
      if (user?.role === 'scout') {
        const res = await contactService.getScoutContactRequests(1, 20);
        setRequests(res.items || []);
      } else {
        const res = await contactService.getPlayerContactRequests(1, 20);
        setRequests(res.items || []);
      }
    } catch (err) {
      console.error('Error fetching contact requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactRequests();
  }, [user?.role]);

  const handleRespond = async (id: string, accept: boolean) => {
    setActionLoadingId(id);
    try {
      await contactService.respondToContactRequest(id, { accept });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: accept ? ('Accepted' as any) : ('Declined' as any) } : req
        )
      );
    } catch (err) {
      console.error('Error responding to contact request:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 pt-2 font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1C2C5E]">الإشعارات وطلبات التواصل 🔔</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            تابع أحدث طلبات التواصل والتنبيهات المباشرة الخاصة بحسابك
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B43A1]" />
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2B43A1] flex items-center justify-center shrink-0 font-bold">
                  <Bell className="w-5 h-5" />
                </div>

                <div className="text-right">
                  <h4 className="font-bold text-sm text-gray-800 mb-0.5">
                    {user?.role === 'scout'
                      ? `طلب تواصل مع اللاعب: ${item.playerName || 'لاعب'}`
                      : `طلب تواصل من الكشاف/النادي: ${item.scoutName || item.clubName || 'كشاف مقيد'}`}
                  </h4>
                  {item.message && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl my-1 border border-gray-100">
                      "{item.message}"
                    </p>
                  )}
                  <span className="text-[10px] text-gray-400 block mt-1">
                    تاريخ الطلب: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.status === 'Pending' && user?.role !== 'scout' ? (
                  <>
                    <button
                      onClick={() => handleRespond(item.id, true)}
                      disabled={actionLoadingId === item.id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      {actionLoadingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      قبول
                    </button>
                    <button
                      onClick={() => handleRespond(item.id, false)}
                      disabled={actionLoadingId === item.id}
                      className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      رفض
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : item.status === 'Declined'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}
                  >
                    {item.status === 'Accepted' ? 'تم القبول' : item.status === 'Declined' ? 'مرفوض' : 'قيد الانتظار'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا توجد طلبات تواصل أو إشعارات جديدة حالياً</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            ستظهر هنا كافة طلبات التواصل بين اللاعبين والكشافين والتنبيهات المباشرة فور حدوثها.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
