import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/ui/Toast';

const ToastContext = createContext(null);
let _nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
    const id = ++_nextId;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, title }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const success = useCallback((message, title) => push({ type: 'success', message, title }),             [push]);
  const error   = useCallback((message, title) => push({ type: 'error',   message, title, duration: 5500 }), [push]);
  const warning = useCallback((message, title) => push({ type: 'warning', message, title }),             [push]);
  const info    = useCallback((message, title) => push({ type: 'info',    message, title }),             [push]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, push, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
