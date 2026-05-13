export function getApiError(err, fallback = 'Ocorreu um erro. Tente novamente.') {
  const msg = err?.response?.data?.message
    || err?.response?.data?.error
    || err?.message;
  if (!msg) return fallback;
  if (msg.includes('ER_ROW_IS_REFERENCED') || msg.includes('foreign key'))
    return 'Não é possível excluir: este item está em uso.';
  if (msg.includes('ER_DUP_ENTRY') || msg.includes('already exists'))
    return 'Já existe um registro com esses dados.';
  if (msg.includes('Network Error') || msg.includes('ECONNREFUSED'))
    return 'Sem conexão com o servidor. Verifique sua internet.';
  return msg;
}
