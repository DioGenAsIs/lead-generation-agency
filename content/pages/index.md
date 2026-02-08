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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // ✅ Важно: отправляем в Supabase ТОЛЬКО лид-форму
    // (а "services-note" с чекбоксами просто не шлём)
    if (elementId !== 'lead-form') {
      // хочешь — можно вообще ничего не делать
      // либо показать лёгкое сообщение:
      // alert('Ок 👍');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData(formRef.current);
      const value = Object.fromEntries(data.entries());

      const payload = {
        name: String(value.name ?? '').trim(),
        phone: String(value.phone ?? '').trim(),
        telegram: String(value.telegram ?? '').trim(),
        course: String(value.course ?? '').trim(),
        budget: String(value.budget ?? '').trim(),
        consent: value.consent === 'on' || value.consent === 'true' || value.consent === true,
        source: 'site',
        utm: getUtmFromUrl()
      };

      // минимальная валидация
      if (!payload.phone || payload.phone.length < 6) {
        alert('Укажите телефон');
        return;
      }
      if (!payload.consent) {
        alert('Нужно согласие на обработку данных');
        return;
      }

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
      <form
        ref={formRef}
        className={className}
        id={elementId}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid gap-6 sm:grid-cols-2">
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
