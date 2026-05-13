export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(num);
};

export const formatCurrencyCompact = (value) => {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1000) {
    return new Intl.NumberFormat('pt-BR', {
      style:             'currency',
      currency:          'BRL',
      notation:          'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  return formatCurrency(num);
};
