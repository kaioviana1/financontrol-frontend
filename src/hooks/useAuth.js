import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const auth = useAuthContext();
  const navigate = useNavigate();

  const login = async (credentials) => {
    await auth.login(credentials);
    navigate('/');
  };

  const register = async (userData) => {
    await auth.register(userData);
    navigate('/');
  };

  const signOut = () => {
    auth.signOut();
    navigate('/login');
  };

  return { ...auth, login, register, signOut };
}
