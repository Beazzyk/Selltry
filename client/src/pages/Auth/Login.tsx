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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <Link to="/" className="font-display text-2xl font-bold text-gray-900 hover:text-primary-600">
            AutoLister
          </Link>
          <p className="mt-2 text-sm text-gray-600">Zaloguj się do swojego konta</p>
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
