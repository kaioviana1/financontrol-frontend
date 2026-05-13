import { useState } from 'react';
import { LuUser, LuMail, LuLock, LuSave, LuEye, LuEyeOff } from 'react-icons/lu';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';
import Spinner from '../components/ui/Spinner';

/* ── Section wrapper ── */
function Section({ title, description, children }) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Profile info form ── */
function ProfileForm({ user, onSaved }) {
  const [form, setForm]     = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Nome deve ter pelo menos 2 caracteres.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setSaving(true);
    try {
      const { data } = await authService.updateProfile({ name: form.name.trim(), email: form.email.trim() });
      onSaved(data.data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao atualizar perfil.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="input-label">Nome completo</label>
        <div className="relative">
          <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className={cn('input pl-9', errors.name && 'border-red-400 focus:ring-red-200')}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label className="input-label">E-mail</label>
        <div className="relative">
          <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            className={cn('input pl-9', errors.email && 'border-red-400 focus:ring-red-200')}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner /> : <><LuSave className="w-4 h-4" /> Salvar alterações</>}
        </button>
      </div>
    </form>
  );
}

/* ── Password form ── */
function PasswordForm() {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [show, setShow]     = useState({ current: false, new: false, confirm: false });
  const toast = useToast();

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Informe a senha atual.';
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Nova senha deve ter pelo menos 6 caracteres.';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'As senhas não coincidem.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setSaving(true);
    try {
      await authService.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (err) {
      toast.error(getApiError(err, 'Erro ao alterar senha.'));
    } finally {
      setSaving(false);
    }
  };

  const ToggleEye = ({ field }) => (
    <button
      type="button"
      onClick={() => setShow((p) => ({ ...p, [field]: !p[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show[field] ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="input-label">Senha atual</label>
        <div className="relative">
          <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={show.current ? 'text' : 'password'}
            className={cn('input pl-9 pr-10', errors.currentPassword && 'border-red-400 focus:ring-red-200')}
            value={form.currentPassword}
            onChange={(e) => set('currentPassword', e.target.value)}
            placeholder="••••••••"
          />
          <ToggleEye field="current" />
        </div>
        {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword}</p>}
      </div>

      <div>
        <label className="input-label">Nova senha</label>
        <div className="relative">
          <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={show.new ? 'text' : 'password'}
            className={cn('input pl-9 pr-10', errors.newPassword && 'border-red-400 focus:ring-red-200')}
            value={form.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <ToggleEye field="new" />
        </div>
        {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
      </div>

      <div>
        <label className="input-label">Confirmar nova senha</label>
        <div className="relative">
          <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={show.confirm ? 'text' : 'password'}
            className={cn('input pl-9 pr-10', errors.confirmPassword && 'border-red-400 focus:ring-red-200')}
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            placeholder="Repita a nova senha"
          />
          <ToggleEye field="confirm" />
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner /> : <><LuLock className="w-4 h-4" /> Alterar senha</>}
        </button>
      </div>
    </form>
  );
}

/* ── Avatar ── */
function Avatar({ name }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-slate-900 text-xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
      {initials}
    </div>
  );
}

/* ── Page ── */
export default function Profile() {
  const { user, updateUser } = useAuth();

  return (
    <div className="page max-w-2xl">
      <div>
        <h1 className="page-title">Meu Perfil</h1>
        <p className="text-sm text-slate-400 mt-0.5">Gerencie suas informações e segurança</p>
      </div>

      {/* User card */}
      <div className="card p-5 flex items-center gap-4">
        <Avatar name={user?.name} />
        <div className="min-w-0">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
          <p className="text-sm text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>

      <Section title="Dados pessoais" description="Atualize seu nome e endereço de e-mail">
        <ProfileForm user={user} onSaved={updateUser} />
      </Section>

      <Section title="Segurança" description="Altere sua senha de acesso">
        <PasswordForm />
      </Section>
    </div>
  );
}
