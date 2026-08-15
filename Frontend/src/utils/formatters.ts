export const formatDuration = (ts?: string): string => {
  if (!ts || typeof ts !== 'string') return '00:30';
  const parts = ts.split(':');
  if (parts.length === 3) {
    const min = parts[1]?.padStart(2, '0') || '00';
    const sec = parts[2]?.split('.')[0]?.padStart(2, '0') || '00';
    return `${min}:${sec}`;
  }
  if (parts.length === 2) {
    const min = parts[0]?.padStart(2, '0') || '00';
    const sec = parts[1]?.split('.')[0]?.padStart(2, '0') || '00';
    return `${min}:${sec}`;
  }
  return ts;
};

export const formatDateArabic = (dateStr?: string): string => {
  if (!dateStr) return 'حديثاً';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'حديثاً';
  }
};
