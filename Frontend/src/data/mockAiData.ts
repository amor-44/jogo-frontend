import type { AnalysisReportDto, PerformanceMetricsDto } from '../types';

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
    welcome: "أهلاً بك! لاحظنا في تحليلك أن قوة التسديد جيدة، لكن هناك حاجة لضبط وضعية الجذع وثبات قدم الارتكاز. هل ترغب في بدء تمارين التصحيح؟",
    answers: {
      "كيف أصحح ميل الجسم؟": "ركز على وضع الركبة والصدر فوق الكرة مباشرة لحظة التسديد، وتثبيت قدم الارتكاز بجانب الكرة بمسافة مناسبة.",
      "تمارين مقترحة": "جرب تمرين التسديد من الثبات مع التركيز على استمرار حركة القدم للأمام، 3 مجموعات يومياً (15 تكرار)."
    }
  },
  scanning_awareness_issue: {
    welcome: "أداء ممتاز في التحكم بالكرة! الملاحظة الأساسية هي زيادة مسح الملعب قبل استلام الكرة لتسريع القرار.",
    answers: {
      "ما هو تمرين المسح البصري؟": "تمرين فحص الكتف (Shoulder Check): عوّد نفسك على النظر مرتين حولك قبل لمس الكرة لتحديد المساحات وزملائك.",
      "كيف أطور قراري تحت الضغط؟": "تدرب على اللعب بلمستين في مساحات ضيقة، مما يساعدك على اتخاذ القرار المسبق قبل الاستلام."
    }
  }
};

/**
 * Deterministic Dynamic Mock Generator
 * Generates rich, realistic, and fully customized AI analysis reports based on video data.
 */
export function generateDynamicAnalysisReport(
  videoId: string,
  videoTitle?: string,
  fileSizeOrSeed?: number
): AnalysisReportDto {
  const seedString = `${videoId}-${videoTitle || 'video'}-${fileSizeOrSeed || 2048}`;
  let hash = 5381;
  for (let i = 0; i < seedString.length; i++) {
    hash = ((hash << 5) + hash) + seedString.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // 1. Calculate overall score in [65, 94]
  const overallScore = 65 + (absHash % 30);

  // Helper to create correlated metric values around the overall score
  const calcMetric = (shift: number, spread = 10) => {
    const delta = ((absHash >> shift) % (spread * 2 + 1)) - spread;
    return Math.min(98, Math.max(52, overallScore + delta));
  };

  // Key metrics with realistic variation
  const ballControl = calcMetric(1, 9);
  const passingAccuracy = calcMetric(3, 11);
  const movementEfficiency = calcMetric(5, 8);
  const attackingImpact = calcMetric(7, 13);
  const decisionMaking = calcMetric(9, 10);
  const positioningScore = calcMetric(11, 11);
  const positionScore = calcMetric(2, 7);
  const defensiveActions = calcMetric(8, 14);

  const metrics: PerformanceMetricsDto = {
    positionScore,
    passingAccuracy,
    ballControl,
    positioningScore,
    movementEfficiency,
    defensiveActions,
    attackingImpact,
    decisionMaking,
    passing: passingAccuracy,
    shooting: attackingImpact,
    dribbling: ballControl,
    speed: movementEfficiency,
    positioning: positioningScore,
    defending: defensiveActions,
  };

  // Trait catalogue for dynamic strengths, weaknesses and recommendations
  const traits = [
    {
      name: 'التحكم بالكرة والمراوغة',
      score: ballControl,
      strength: 'مهارة فائقة في ترويض واستلام الكرة بسلاسة تحت الضغط العالي',
      weakness: 'فقدان التوازن أحياناً أثناء تغيير الاتجاه المفاجئ في المساحات الضيقة',
      recommendation: 'تمارين التحكم السريع والسيطرة بكلتا القدمين بين الحواجز (Cone Drills)',
    },
    {
      name: 'دقة التمرير وصناعة اللعب',
      score: passingAccuracy,
      strength: 'دقة متناهية في التمريرات البينية وتوزيع اللعب لزملائه برؤية واضحة',
      weakness: 'تأخر طفيف في إرسال الكرات الطولية العكسية خلف خطوط الخصم',
      recommendation: 'تدريبات التمرير السريع من لمسة واحدة ومحاكاة مواقف الروندو (One-touch Rondo)',
    },
    {
      name: 'كفاءة الحركة والسرعة',
      score: movementEfficiency,
      strength: 'انطلاقات سريعة بالكرة والقدرة على تغيير الإيقاع الحركي بكفاءة',
      weakness: 'هبوط نسبي في الإيقاع البدني أثناء الارتداد السريع للحالة الدفاعية',
      recommendation: 'تمارين التحمل اللاهوائي والسرعات المتقطعة التكرارية (HIIT & Sprint Drills)',
    },
    {
      name: 'التأثير الهجومي وإنهاء الهجمات',
      score: attackingImpact,
      strength: 'حس تهديفي مميز والجرأة العالية في التسديد المباشر نحو المرمى',
      weakness: 'التسرع أحياناً في إنهاء الهجمات دون مسح زاوية تمركز حارس المرمى',
      recommendation: 'تمارين إنهاء الهجمات تحت ضغط ومحاكاة مواقف 1 ضد 1 في الثلث الأخير',
    },
    {
      name: 'سرعة ودقة اتخاذ القرار',
      score: decisionMaking,
      strength: 'ذكاء تكتيكي مميز وسرعة بديهة في اختيار أفضل حل هجومي متاح',
      weakness: 'التردد أحياناً بين التمرير المباشر السريع أو محاولة الاحتفاظ بالكرة',
      recommendation: 'ألعاب تكتيكية مصغرة (Small-Sided Games) لتحسين سرعة القرار تحت ضغط زمني',
    },
    {
      name: 'التمركز والرؤية الميدانية',
      score: positioningScore,
      strength: 'تمركز ميداني ذكي والتحرك المستمر في المساحات الشاغرة دون كرة',
      weakness: 'الحاجة لتكثيف المسح البصري (Scanning) قبل استلام الكرة بجزء من الثانية',
      recommendation: 'تمارين فحص الكتف (Shoulder Check Drills) قبل استلام التمريرة',
    },
    {
      name: 'الضغط والتدخلات الدفاعية',
      score: defensiveActions,
      strength: 'شراسة إيجابية في الضغط العالي واسترجاع الكرة في مناطق متقدمة',
      weakness: 'الاندفاع الزائد في بعض التدخلات مما يتيح للخصم فرصة المرور',
      recommendation: 'تدريبات التغطية العكسية والمواجهات الثنائية الدفاعية (1v1 Defending)',
    },
  ];

  // Sort traits by calculated score
  const sortedTraits = [...traits].sort((a, b) => b.score - a.score);

  // Top 3 strengths
  const strengths = sortedTraits.slice(0, 3).map((t) => t.strength);

  // Bottom 2 weaknesses
  const weaknesses = sortedTraits.slice(-2).reverse().map((t) => t.weakness);

  // Recommendations directly targeted to weaknesses + general recommendation
  const recommendations = [
    ...sortedTraits.slice(-2).reverse().map((t) => t.recommendation),
    'جلسات تحليل بالفيديو لمراجعة زوايا التحرك واتخاذ القرار التكتيكي',
  ];

  // Dynamic summary
  let summaryPrefix = 'أداء واعد ومبشر مع إمكانيات فنية جيدة.';
  if (overallScore >= 85) {
    summaryPrefix = 'أداء استثنائي وعالي الجودة في هذا المقطع.';
  } else if (overallScore >= 75) {
    summaryPrefix = 'أداء قوي ومتزن مع فاعلية تكتيكية واضحة.';
  }

  const topTrait = sortedTraits[0];
  const lowestTrait = sortedTraits[sortedTraits.length - 1];

  const summary = `${summaryPrefix} يُظهر اللاعب تفوقاً لافتاً في ${topTrait.name} (${topTrait.score}%)، مما يمنحه أفضلية تنافسية. لتحقيق قفزة نوعية في التقييم، يوصى بالتركيز على تطوير ${lowestTrait.name} (${lowestTrait.score}%) عبر خطة التدريب المحددة.`;

  return {
    id: `report-${videoId}-${absHash % 10000}`,
    videoId,
    videoTitle: videoTitle || 'فيديو التحليل الفني',
    overallScore,
    summary,
    strengths,
    weaknesses,
    recommendations,
    aiModelVersion: 'JogoAI-v2.1',
    generatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    metrics,
    performanceMetrics: metrics,
  };
}
