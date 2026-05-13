const toDatePart = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value).split('T')[0];
};

export const formatDate = (dateStr) => {
  const raw = toDatePart(dateStr);
  if (!raw) return '—';
  const date = new Date(raw + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateShort = (dateStr) => {
  const raw = toDatePart(dateStr);
  if (!raw) return '—';
  const date = new Date(raw + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
};

export const formatMonthYear = (year, month) => {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const toInputDate = (dateStr) => {
  return toDatePart(dateStr) ?? '';
};

export const todayInputDate = () => {
  return new Date().toISOString().split('T')[0];
};
