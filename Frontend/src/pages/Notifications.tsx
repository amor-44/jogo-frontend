const Notifications = () => {
  const notificationsList = [
    { id: 1, title: "تحليل جديد جاهز", desc: "قام المدرب الذكي بتحديث تقرير أداء اللاعب عبدالرحمن الغامدي.", time: "منذ 10 دقائق", type: "ai", read: false },
    { id: 2, title: "لاعب جديد مضاف", desc: "انضم لاعب جديد بنفس اهتماماتك الرياضية إلى المنصة.", time: "منذ ساعة", type: "system", read: false },
    { id: 3, title: "ترشيح ذكي", desc: "الذكاء الاصطناعي يوصي بمشاهدة ملف اللاعب رياض محرز.", time: "منذ 3 ساعات", type: "ai", read: true },
    { id: 4, title: "تحديث حساب", desc: "تم تحديث بيانات النادي بنجاح.", time: "منذ يومين", type: "system", read: true },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 pt-2" dir="rtl">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-blue-800">الإشعارات 🔔</h1>
        <button className="text-xs text-blue-600 font-bold hover:underline">تحديد الكل كتقروء</button>
      </div>

      <div className="space-y-3">
        {notificationsList.map((item) => (
          <div 
            key={item.id} 
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
              item.read ? 'bg-white border-gray-100' : 'bg-blue-50/40 border-blue-100 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              item.type === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {item.type === 'ai' ? '🤖' : '📢'}
            </div>
            
            <div className="flex-1 text-right">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-sm text-gray-800">{item.title}</h4>
                <span className="text-[10px] text-gray-400">{item.time}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;