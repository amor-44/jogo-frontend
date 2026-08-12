import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { contactService } from '../../services/contactService';
import { ContactRequestStatus, type ContactRequestDto } from '../../types';
import { Bell, Loader2, Check, X } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContactRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContactRequests = async () => {
      try {
        if (user?.role === 'scout') {
          const res = await contactService.getScoutContactRequests(1, 20);
          if (isMounted) {
            setRequests(res.items || []);
          }
        } else {
          const res = await contactService.getPlayerContactRequests(1, 20);
          if (isMounted) {
            setRequests(res.items || []);
          }
        }
      } catch (err) {
        console.error('Error fetching contact requests:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadContactRequests();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleRespond = async (id: string, accept: boolean) => {
    setActionLoadingId(id);
    try {
      await contactService.respondToContactRequest(id, { accept });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: accept
                  ? ContactRequestStatus.Accepted
                  : ContactRequestStatus.Declined,
              }
            : req
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
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B43A1]" />
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => {
            const isScout = user?.role === 'scout';
            const title = isScout
              ? `طلب تواصل للاعب: ${req.playerName || 'لاعب'}`
              : `طلب تواصل من: ${req.scoutOrganization || req.scoutName || 'كشاف'}`;
            const subTitle = isScout ? req.playerClub : req.scoutCountry;

            return (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2B43A1] flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C2C5E] mb-0.5">{title}</h4>
                    {subTitle && <p className="text-xs text-gray-500">{subTitle}</p>}
                    {req.message && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl mt-2 border border-gray-100">
                        💬 &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString('ar-EG') : 'حديثاً'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {req.status === 'Pending' || req.status === 0 ? (
                    !isScout ? (
                      <>
                        <button
                          onClick={() => handleRespond(req.id, true)}
                          disabled={actionLoadingId === req.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> قبول
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, false)}
                          disabled={actionLoadingId === req.id}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> رفض
                        </button>
                      </>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                        قيد الانتظار
                      </span>
                    )
                  ) : req.status === 'Accepted' || req.status === 1 ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> تم القبول
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl">
                      تم الرفض
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
          <span className="text-4xl mb-3 block">📭</span>
          <h3 className="text-base font-bold text-gray-700 mb-1">لا توجد إشعارات أو طلبات تواصل</h3>
          <p className="text-xs text-gray-400">ستظهر طلبات التواصل والتنبيهات المباشرة هنا عند استلامها.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
