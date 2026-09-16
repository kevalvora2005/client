import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPasswordApi } from '../api/authApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showSuccess, showError } from '../../../utils/toast';
import useAuth from '../../../hooks/useAuth';
import { setAccessToken, setRefreshToken } from '../../../config/api';

import { useTranslation } from 'react-i18next';

export const useResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const emailParam = searchParams.get('email') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: emailParam || user?.email || '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email(t('validation.email_invalid'))
        .required(t('validation.email_req')),
      code: Yup.string()
        .trim()
        .required(t('validation.code_req')),
      newPassword: Yup.string()
        .min(8, t('validation.password_min8'))
        .matches(/[A-Z]/, t('validation.password_uppercase'))
        .matches(/[0-9]/, t('validation.password_number'))
        .matches(/[\W_]/, t('validation.password_special'))
        .required(t('validation.new_password_req')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], t('validation.password_match'))
        .required(t('validation.confirm_password_req')),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const payload = {
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
        showSuccess('auth.password_reset_success');

        const userObj = res?.user || user;
        if (userObj) {
          updateUser({ ...userObj, mustResetPassword: false });
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
        showError(getErrorMessage(err, t('auth.reset_password_failed')));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    formik,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
  };
};

