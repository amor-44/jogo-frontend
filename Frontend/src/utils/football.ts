export const POSITION_ARABIC_MAP: Record<string, string> = {
  Goalkeeper: 'حارس',
  GK: 'حارس',
  CenterBack: 'قلب دفاع',
  CB: 'قلب دفاع',
  RightBack: 'ظهير أيمن',
  RB: 'ظهير أيمن',
  LeftBack: 'ظهير أيسر',
  LB: 'ظهير أيسر',
  DefensiveMidfielder: 'وسط دفاعي',
  CDM: 'وسط دفاعي',
  CentralMidfielder: 'وسط',
  CM: 'وسط',
  AttackingMidfielder: 'وسط هجومي',
  CAM: 'وسط هجومي',
  LeftWinger: 'جناح أيسر',
  LW: 'جناح أيسر',
  RightWinger: 'جناح أيمن',
  RW: 'جناح أيمن',
  Striker: 'مهاجم',
  ST: 'مهاجم',
};

export const getPositionLabel = (pos?: string): string => {
  if (!pos) return 'غير محدد';
  return POSITION_ARABIC_MAP[pos] || pos;
};

export const ARAB_COUNTRIES = [
  'الكل', 'مصر', 'السعودية', 'الإمارات', 'المغرب', 'الجزائر', 'تونس',
  'قطر', 'الكويت', 'البحرين', 'عمان', 'الأردن', 'لبنان', 'سوريا',
  'العراق', 'فلسطين', 'السودان', 'ليبيا', 'اليمن', 'موريتانيا'
];

export const POSITION_SEARCH_OPTIONS = [
  'الكل', 'مهاجم', 'جناح أيمن', 'جناح أيسر', 'وسط', 'وسط دفاعي', 'وسط هجومي', 'قلب دفاع', 'ظهير أيمن', 'ظهير أيسر', 'حارس'
];
