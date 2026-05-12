import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi, getMe } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/toast';
import { SelltryLogo } from '@/pages/Landing/SelltryLogo';

const schema = z.object({
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  email: z.string().email('Nieprawidłowy email'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await registerApi(data);
      const user = await getMe();
      setUser(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast(msg ?? 'Błąd rejestracji', 'error');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
            <SelltryLogo size={32} />
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>Selltry</span>
          </Link>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>Utwórz konto</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Zacznij sprzedawać na 4 platformach</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="auth-label" htmlFor="name">Imię i nazwisko</label>
            <input id="name" type="text" placeholder="Jan Kowalski" className="auth-input" {...register('name')} />
            {errors.name && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>}
          </div>
          <div>
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="jan@przykład.pl" className="auth-input" {...register('email')} />
            {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>
          <div>
            <label className="auth-label" htmlFor="password">Hasło</label>
            <input id="password" type="password" placeholder="Minimum 8 znaków" className="auth-input" {...register('password')} />
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>
          <button type="submit" className="auth-btn-primary" disabled={isSubmitting} style={{ marginTop: 4 }}>
            {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się za darmo'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)', marginTop: 20, fontFamily: 'var(--font-sans)' }}>
          Masz już konto?{' '}
          <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 500, textDecoration: 'none' }}>
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
