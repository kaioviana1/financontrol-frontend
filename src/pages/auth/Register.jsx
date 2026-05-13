import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuUser, LuMail, LuLock, LuLoader, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuth } from '../../hooks/useAuth';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório.';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres.';
  }
  if (!form.email.trim()) {
    errors.email = 'E-mail é obrigatório.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  if (!form.password) {
    errors.password = 'Senha é obrigatória.';
  } else if (form.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirme a senha.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'As senhas não conferem.';
  }
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const { name, email, password } = form;
      await register({ name, email, password });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar conta</h1>
      <p className="text-sm text-slate-500 mb-8">Comece a controlar suas finanças hoje</p>

      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nome */}
        <div>
          <label className="input-label">Nome</label>
          <div className="relative">
            <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Seu nome completo"
              className={`input pl-10 ${errors.name ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* E-mail */}
        <div>
          <label className="input-label">E-mail</label>
          <div className="relative">
            <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="seu@email.com"
              className={`input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Senha */}
        <div>
          <label className="input-label">Senha</label>
          <div className="relative">
            <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              className={`input pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPass ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Confirmar Senha */}
        <div>
          <label className="input-label">Confirmar senha</label>
          <div className="relative">
            <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita a senha"
              className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}`}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirm ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? <LuLoader className="w-4 h-4 animate-spin" /> : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Já tem conta?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
