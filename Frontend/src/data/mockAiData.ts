export interface VideoAnalysisResult {
  id: string;
  videoTitle: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  metrics: {
    shootingAccuracy: number;
    ballControl: number;
    decisionMaking: number;
    staminaPace: number;
  };
  coachSummary: string;
  suggestedChatContext: string;
}

export const MOCK_ANALYSIS_CASES: VideoAnalysisResult[] = [
  {
    id: "video-1",
    videoTitle: "تحليل التسديد وإنهاء الهجمات",
    overallScore: 68,
    strengths: ["سرعة اتخاذ قرار التسديد", "قوة التسديد بالقدم اليمنى"],
    weaknesses: ["زاوية ميل الجذع أثناء التسديد", "ضعف التوجيه بالقدم اليسرى"],
    metrics: {
      shootingAccuracy: 60,
      ballControl: 75,
      decisionMaking: 70,
      staminaPace: 80,
    },
    coachSummary: "تسديدات قوية ولكن تفتقر إلى الدقة بسبب عدم تثبيت قدم الارتكاز وميل الجسم للخلف أثناء الركل.",
    suggestedChatContext: "shooting_form_issue"
  },
  {
    id: "video-2",
    videoTitle: "تحليل التحكم والمراوغة تحت الضغط",
    overallScore: 84,
    strengths: ["تحكم ممتاز بالكرة في المساحات الضيقة", "رؤية جيدة للملعب والتمرير السريع"],
    weaknesses: ["تأخر بسيط في رفع الرأس قبل التمرير النهائي"],
    metrics: {
      shootingAccuracy: 82,
      ballControl: 89,
      decisionMaking: 85,
      staminaPace: 86,
    },
    coachSummary: "أداء متميز في الاستلام والتسليم، تحتاج فقط لتحسين مسح الملعب (Scanning) قبل استلام الكرة بجزء من الثانية.",
    suggestedChatContext: "scanning_awareness_issue"
  }
];

export const MOCK_CHAT_RESPONSES: Record<string, { welcome: string; answers: Record<string, string> }> = {
  shooting_form_issue: {
    welcome: "أهلاً بك يا بطل! لاحظت في تحليلك الأخير أن قوة تسديدك ممتازة، لكن هناك مشكلة في ميل الجذع للخلف مما يجعل الكرة ترتفع فوق العارضة. تحب نبدأ بتمارين تصحيح الوقوف؟",
    answers: {
      "ازاي اصلح ميل جسمي؟": "ركز على وضع ركبتك وصدرك فوق الكرة مباشرة لحظة التسديد، وثبّت قدم الارتكاز بجانب الكرة بمسافة 15 سم وليس خلفها.",
      "تمارين مقترحة": "جرب تمرين التسديد من الثبات مع التركيز على متابعة حركة القدم (Follow-through) للأمام وليس للأعلى، 3 مجموعات يومياً (15 تكرار)."
    }
  },
  scanning_awareness_issue: {
    welcome: "أداء ممتاز في التحكم بالكرة! ملاحظتي الوحيدة هي حاجتك لزيادة 'مسح الملعب' (Scanning) برأسك قبل استلام الكرة لتسريع التمرير.",
    answers: {
      "ايه تمرين الـ scanning؟": "تمرين فحص الكتف (Shoulder Check): عوّد نفسك تلف رأسك مرتين يمين وشمال قبل أن تلمس الكرة لتحديد أماكن زملائك والمنافسين.",
      "ازاي اطور قراري تحت الضغط؟": "العب بلمستين فقط (Two-Touch Drills) في مساحات ضيقة، ده هيجبر عقلك يقرر التمريرة قبل استلام الكرة."
    }
  }
};