import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from './store/hooks';
import { silentRefresh } from './features/auth/store/authSlice';
import useAuth from './hooks/useAuth';
import { SocketProvider } from './context/SocketProvider';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    dispatch(silentRefresh());
  }, [dispatch]);

  useEffect(() => {
    if (user?.preferredLanguage && i18n.language !== user.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage, i18n]);

  return (
    <SocketProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </SocketProvider>
  );
};

export default App;