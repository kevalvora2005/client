import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../../hooks/useAuth';
import { showError, showSuccess } from '../../../utils/toast';

const validationSchema = Yup.object({
  identifier: Yup.string()
    .trim()
    .required('Email or phone number is required'),
  password: Yup.string()
    .min(1, 'Password is required')
    .required('Password is required'),
});

const useLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const user = await login({
          identifier: values.identifier.trim(),
          password: values.password,
        });
        showSuccess('Logged in successfully');
        if (user?.mustResetPassword) {
          navigate(`/reset-password?email=${encodeURIComponent(user.email)}`, { replace: true });
        } else {
          const role = user?.role?.toLowerCase();
          if (role === 'admin') {
            navigate('/residents', { replace: true });
          } else if (role === 'resident') {
            navigate('/my-apartment', { replace: true });
          } else if (role === 'security') {
            navigate('/security', { replace: true });
          } else {
            navigate('/residents', { replace: true });
          }
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        showError(
          axiosError?.response?.data?.error || 'Invalid credentials.'
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  return {
    formik,
    showPassword, setShowPassword,
    isLoading,
    handleSubmit,
  };
};

export default useLogin;
