import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

type Props = {
  elementId?: string;
  className?: string;
  fields?: any[];
  submitLabel?: string;
  styles?: any;
  // любые дополнительные поля из Stackbit
  [key: string]: any;
};

function getUtmFromUrl() {
  if (typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export default function FormBlock(props: Props) {
  const { elementId = 'form', className, fields = [], submitLabel = 'Submit', styles = {} } = props;

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!fields || fields.length === 0) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // ✅ Отправляем в Supabase/Netlify только лид-форму (lead-form).
    // services-note (чекбоксы) можно не слать.
    if (elementId !== 'lead-form') return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current);

      // безопасно читаем значения как строки
      const name = String(formData.get('name') ?? '').trim();
      const phone = String(formData.get('phone') ?? '').trim();
      const telegram = String(formData.get('telegram') ?? '').trim();
      const course = String(formData.get('course') ?? '').trim();
      const budget = String(formData.get('budget') ?? '').trim();

      // ✅ чекбокс: если отмечен — значение 'on', иначе null
      const consent = formData.get('consent') === 'on';

      // минимальная валидация
      if (!phone || phone.replace(/\D/g, '').length < 6) {
        alert('Укажите телефон');
        return;
      }
      if (!consent) {
        alert('Нужно согласие на обработку персональных данных');
        return;
      }

      const payload = {
        name,
        phone,
        telegram,
        course,
        budget,
        source: 'site',
        utm: getUtmFromUrl()
      };

      const res = await fetch('/.netlify/functions/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error ? `Ошибка: ${err.error}` : 'Ошибка отправки заявки');
        return;
      }

      alert('Заявка отправлена 🚀');
      formRef.current.reset();
    } catch (err: any) {
      alert(`Ошибка: ${err?.message || 'что-то пошло не так'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Annotated content={props}>
      <form className={className} name={elementId} id={elementId} onSubmit={handleSubmit} ref={formRef}>
        <div className="grid gap-6 sm:grid-cols-2">
          <input type="hidden" name="form-name" value={elementId} />
          {fields.map((field, index) => (
            <DynamicComponent key={index} {...field} />
          ))}
        </div>

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
