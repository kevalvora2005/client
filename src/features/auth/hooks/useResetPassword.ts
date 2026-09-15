import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPasswordApi } from '../api/authApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';
import useAuth from '../../../hooks/useAuth';
import { setAccessToken, setRefreshToken } from '../../../config/api';

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const token = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    email: !token
      ? Yup.string().trim().email('Please provide a valid email').required('Email is required')
      : Yup.string(),
    code: !token
      ? Yup.string().trim().required('Verification code is required')
      : Yup.string(),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Must contain at least one number')
      .matches(/[\W_]/, 'Must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
      .required('Please confirm your password'),
  });

  const formik = useFormik({
    initialValues: {
      email: emailParam || user?.email || '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const payload = token
          ? { token, newPassword: values.newPassword }
          : {
              email: values.email.trim(),
              code: values.code.trim(),
              newPassword: values.newPassword,
            };

        const res = await resetPasswordApi(payload);
        if (res?.accessToken) {
          setAccessToken(res.accessToken);
        }
        if (res?.refreshToken) {
          setRefreshToken(res.refreshToken);
        }
        showSuccess('Password updated successfully!');

        const userObj = res?.user || user;
        if (userObj) {
          updateUser({ ...userObj, mustResetPassword: false, resetToken: undefined });
          const role = userObj.role?.toLowerCase();
          if (role === 'resident') {
            navigate('/my-apartment', { replace: true });
          } else if (role === 'security') {
            navigate('/security', { replace: true });
          } else {
            navigate('/residents', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err: unknown) {
        showError(getErrorMessage(err, 'Failed to reset password. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    token,
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
  };
};

