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
};

function getUtmFromUrl() {
  if (typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export default function FormBlock(props: Props) {
  const { elementId, className, fields = [], submitLabel, styles = {} } = props;

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!fields?.length) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // Отправляем в Supabase только лид-форму
    if (elementId !== 'lead-form') {
      // Например, services-note просто не отправляем никуда
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData(formRef.current);
      const value = Object.fromEntries(data.entries());

      const phone = String(value.phone || '').trim();
      const consent = value.consent === 'on' || value.consent === 'true' || value.consent === true;

      if (!phone || phone.length < 6) {
        alert('Укажите телефон');
        return;
      }

      if (!consent) {
        alert('Нужно согласие на обработку персональных данных');
        return;
      }

      const payload = {
        name: String(value.name || '').trim(),
        phone,
        telegram: String(value.telegram || '').trim(),
        course: String(value.course || '').trim(),
        budget: String(value.budget || '').trim(),
        consent: true,
        source: 'site',
        utm: getUtmFromUrl()
      };

      const res = await fetch('/.netlify/functions/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const out = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(out?.error ? `Ошибка: ${out.error}` : 'Ошибка отправки заявки');
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
