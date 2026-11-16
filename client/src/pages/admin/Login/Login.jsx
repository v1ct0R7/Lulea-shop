import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Seo from '../../../components/ui/Seo/Seo';
import Button from '../../../components/ui/Button/Button';
import styles from './Login.module.css';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <Seo title="Hyrje Admin" noindex />
      <form className={styles.card} onSubmit={submit}>
        <img src="/logo.png" alt="Lulea" width="120" height="120" />
        <h1>Paneli i administrimit</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label htmlFor="u">Përdoruesi</label>
          <input id="u" className="input" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="p">Fjalëkalimi</label>
          <input id="p" className="input" type="password" autoCapitalize="none" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button type="submit" block size="lg" loading={busy}>Hyr</Button>
      </form>
    </div>
  );
}
