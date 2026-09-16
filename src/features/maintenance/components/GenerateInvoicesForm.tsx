import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from '../../../components/DatePicker/DatePicker';
import type { GenerateInvoicesPayload } from '../types/maintenance.types';

interface GenerateInvoicesFormProps {
  loading: boolean;
  onSubmit: (payload: GenerateInvoicesPayload) => Promise<boolean>;
  onCancel: () => void;
}

const getMonthOptions = (locale: string) =>
  Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, i, 15)),
  }));

const GenerateInvoicesForm = ({ loading, onSubmit, onCancel }: GenerateInvoicesFormProps) => {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const monthOptions = useMemo(() => getMonthOptions(i18n.language || 'en'), [i18n.language]);
  const [extraChargesTouched, setExtraChargesTouched] = useState<{ label: boolean; amount: boolean }[]>([]);

  const validationSchema = useMemo(() => Yup.object({
    month: Yup.number().required(t('validation.month_req')),
    year: Yup.number().required(t('validation.year_req')).min(2000, t('validation.year_min2000')),
    dueDate: Yup.string()
      .required(t('validation.due_date_req'))
      .test('future-date', t('validation.due_date_future'), (value) => {
        if (!value) return false;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        return selectedDate > todayStart;
      }),
    extraCharges: Yup.array().of(
      Yup.object({
        label: Yup.string().test('label-required', t('validation.charge_desc_req'), function (value) {
          const { amount } = this.parent;
          if ((value && value.trim() !== '') || (amount && String(amount).trim() !== '')) {
            return !!(value && value.trim() !== '');
          }
          return true;
        }),
        amount: Yup.string().test('amount-required', t('validation.charge_amount_req'), function (value) {
          const { label } = this.parent;
          if ((label && label.trim() !== '') || (value && value.trim() !== '')) {
            if (!value || value.trim() === '') return false;
            const num = Number(value);
            return !isNaN(num) && num > 0;
          }
          return true;
        }),
      }),
    ),
  }), [t]);

  const formik = useFormik({
    initialValues: {
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      dueDate: tomorrowStr,
      extraCharges: [] as { label: string; amount: string }[],
    },
    validationSchema,
    onSubmit: async (values) => {
      const validatedExtraCharges = values.extraCharges
        .filter((c) => c.label.trim() !== '' && c.amount.trim() !== '')
        .map((c) => ({
          label: c.label.trim(),
          amount: Number(c.amount),
        }));

      const success = await onSubmit({
        month: values.month,
        year: values.year,
        dueDate: values.dueDate,
        extraCharges: validatedExtraCharges.length > 0 ? validatedExtraCharges : undefined,
      });

      if (success) {
        formik.resetForm();
        setExtraChargesTouched([]);
      }
    },
  });

  const handleChargeBlur = (index: number, field: 'label' | 'amount') => {
    const updated = [...extraChargesTouched];
    const current = updated[index] ?? { label: false, amount: false };
    updated[index] = {
      label: field === 'label' ? true : current.label,
      amount: field === 'amount' ? true : current.amount,
    };
    setExtraChargesTouched(updated);
    formik.setFieldTouched(`extraCharges[${index}].${field}`, true, false);
  };

  return (
    <form onSubmit={formik.handleSubmit}>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>{t('maintenance.month')}</label>
          <select
            className="form-select shadow-none"
            name="month"
            value={formik.values.month}
            onChange={formik.handleChange}
            style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="col-6">
          <label className="form-label fw-medium" style={{ fontSize: '0.85rem' }}>{t('maintenance.year')}</label>
          <input
            type="number"
            className="form-control shadow-none"
            name="year"
            value={formik.values.year}
            onChange={formik.handleChange}
            style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div className="mb-3">
        <DatePicker
          label={t('maintenance.due_date')}
          name="dueDate"
          required
          minDate={tomorrowStr}
          value={formik.values.dueDate}
          onChange={(e) => {
            const val = typeof e === 'string' ? e : e?.target?.value;
            formik.setFieldValue('dueDate', val);
          }}
          onBlur={() => formik.setFieldTouched('dueDate', true)}
          error={formik.errors.dueDate}
          touched={formik.touched.dueDate}
          style={{ height: '40px' }}
        />
      </div>

      {/* ── Extra Charges Section ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="form-label fw-medium mb-0" style={{ fontSize: '0.85rem' }}>
            {t('maintenance.extra_charges_optional')}
          </label>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2"
            onClick={() => {
              formik.setFieldValue('extraCharges', [...formik.values.extraCharges, { label: '', amount: '' }]);
              setExtraChargesTouched([...extraChargesTouched, { label: false, amount: false }]);
            }}
            style={{ fontSize: '0.78rem', borderRadius: '6px' }}
          >
            <i className="bi bi-plus-lg" /> {t('maintenance.add_charge')}
          </button>
        </div>

        {formik.values.extraCharges.length > 0 && (
          <div className="d-flex flex-column gap-3 pe-1" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {formik.values.extraCharges.map((charge, index) => {
              const chargeError = formik.errors.extraCharges?.[index] as { label?: string; amount?: string } | undefined;
              const chargeTouched = extraChargesTouched[index];

              return (
                <div key={index} className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        placeholder={t('maintenance.charge_desc_placeholder')}
                        className={`form-control form-control-sm shadow-none ${chargeTouched?.label && chargeError?.label ? 'is-invalid' : ''}`}
                        value={charge.label}
                        onChange={(e) => {
                          formik.setFieldValue(`extraCharges[${index}].label`, e.target.value);
                        }}
                        onBlur={() => handleChargeBlur(index, 'label')}
                        style={{
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          borderColor: chargeTouched?.label && chargeError?.label ? '#dc3545' : '#e5e7eb'
                        }}
                      />
                    </div>
                    <div style={{ width: '130px' }}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-light-subtle" style={{ fontSize: '0.8rem' }}>₹</span>
                        <input
                          type="number"
                          placeholder={t('maintenance.charge_amount_placeholder')}
                          className={`form-control shadow-none ${chargeTouched?.amount && chargeError?.amount ? 'is-invalid' : ''}`}
                          value={charge.amount}
                          onChange={(e) => {
                            formik.setFieldValue(`extraCharges[${index}].amount`, e.target.value);
                          }}
                          onBlur={() => handleChargeBlur(index, 'amount')}
                          style={{
                            borderRadius: '0 6px 6px 0',
                            fontSize: '0.8rem',
                            borderColor: chargeTouched?.amount && chargeError?.amount ? '#dc3545' : '#e5e7eb'
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger border-0 rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                      onClick={() => {
                        const updated = formik.values.extraCharges.filter((_: unknown, i: number) => i !== index);
                        formik.setFieldValue('extraCharges', updated);
                        setExtraChargesTouched(extraChargesTouched.filter((_, i) => i !== index));
                      }}
                      style={{ width: '28px', height: '28px' }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                  {((chargeTouched?.label && chargeError?.label) || (chargeTouched?.amount && chargeError?.amount)) && (
                    <div className="d-flex flex-column gap-1 ps-1">
                      {chargeTouched?.label && chargeError?.label && (
                        <div className="text-danger small" style={{ fontSize: '0.75rem' }}>{chargeError.label}</div>
                      )}
                      {chargeTouched?.amount && chargeError?.amount && (
                        <div className="text-danger small" style={{ fontSize: '0.75rem' }}>{chargeError.amount}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="d-flex gap-2 justify-content-end border-top border-light-subtle pt-3">
        <button
          type="button"
          className="btn btn-outline-secondary rounded-2 px-3 small"
          onClick={onCancel}
          disabled={loading}
          style={{ height: '38px', fontSize: '0.875rem' }}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn-dark fw-medium px-3 d-inline-flex align-items-center"
          disabled={loading}
          style={{ height: '38px', fontSize: '0.875rem', borderRadius: '8px', opacity: loading ? 0.55 : 1 }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          ) : (
            t('maintenance.generate_invoices_btn')
          )}
        </button>
      </div>

    </form>
  );
};

export default GenerateInvoicesForm;
