import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { forgotPasswordApi } from '../api/authApi';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { showError } from '../../../utils/toast';

import { useTranslation } from 'react-i18next';

export const useForgotPassword = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email(t('validation.email_invalid'))
        .required(t('validation.email_req')),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await forgotPasswordApi(values.email.trim());
        setIsSubmitted(true);
      } catch (err: unknown) {
        showError(getErrorMessage(err, t('auth.forgot_password_failed')));
      } finally {
        setIsLoading(false);
      }
    },
  });

  return {
    formik,
    isLoading,
    isSubmitted,
  };
};
