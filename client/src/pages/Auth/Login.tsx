import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { login, getMe } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/toast';
import { SelltryLogo } from '@/pages/Landing/SelltryLogo';

const schema = z.object({
  email: z.string().email('Nieprawidłowy email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await login(data);
      const user = await getMe();
      setUser(user);
      navigate('/dashboard');
    } catch {
      toast('Nieprawidłowy email lub hasło', 'error');
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
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>Zaloguj się</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>Witaj z powrotem w Selltry</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="jan@przykład.pl" className="auth-input" {...register('email')} />
            {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="auth-label" htmlFor="password" style={{ margin: 0 }}>Hasło</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Zapomniałeś?</a>
            </div>
            <input id="password" type="password" placeholder="••••••••" className="auth-input" {...register('password')} />
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>}
          </div>
          <button type="submit" className="auth-btn-primary" disabled={isSubmitting} style={{ marginTop: 4 }}>
            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)', marginTop: 20, fontFamily: 'var(--font-sans)' }}>
          Nie masz konta?{' '}
          <Link to="/register" style={{ color: 'var(--navy)', fontWeight: 500, textDecoration: 'none' }}>
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
