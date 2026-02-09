import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

function getUtmFromUrl() {
  if (typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export default function FormBlock(props: any) {
  const { elementId, className, fields = [], submitLabel, styles = {} } = props;
  const formRef = React.useRef<HTMLFormElement | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!fields?.length) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    setError(null);

    const formData = new FormData(formRef.current);

    // ✅ Проверка галочки до отправки
    const consentValue = formData.get('consent'); // 'on' если отмечен, иначе null
    const consentOk = consentValue === 'on' || consentValue === 'true' || consentValue === '1';

    if (!consentOk) {
      setError('Нужно согласиться на обработку персональных данных.');
      return;
    }

    const phone = String(formData.get('phone') || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 6) {
      setError('Укажите телефон.');
      return;
    }

    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone,
      telegram: String(formData.get('telegram') || '').trim(),
      course: String(formData.get('course') || '').trim(),
      budget: String(formData.get('budget') || '').trim(),
      source: 'site',
      utm: getUtmFromUrl(),
      consent: true,         // ✅ на бэк передаём, но в БД он не сохраняется
      hp: '',                // honeypot (если захочешь добавить скрытое поле)
      ts: Date.now()         // timestamp антибот
    };

    setIsSubmitting(true);

    try {
      const res = await fetch('/.netlify/functions/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || 'Ошибка отправки заявки');
        return;
      }

      formRef.current.reset();
      alert('Заявка отправлена 🚀');
    } catch (err: any) {
      setError(err?.message || 'Что-то пошло не так');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Annotated content={props as any}>
      <form
        className={className}
        name={elementId}
        id={elementId}
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <input type="hidden" name="form-name" value={elementId} />
          {fields.map((field: any, index: number) => (
            <DynamicComponent key={index} {...field} />
          ))}
        </div>

        {error && (
          <div className="mt-4 text-sm" role="alert">
            {error}
          </div>
        )}

        <div className={classNames('mt-8', mapStyles({ textAlign: styles?.self?.textAlign ?? 'left' }))}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={classNames(
              'inline-flex items-center justify-center px-5 py-4 text-lg transition border-2 border-current hover:bottom-shadow-6 hover:-translate-y-1.5',
              isSubmitting && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Отправляем…' : submitLabel}
          </button>
        </div>
      </form>
    </Annotated>
  );
}
