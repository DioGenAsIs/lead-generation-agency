import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

// Минимальный тип, чтобы не ругался Annotated (HasAnnotation)
type HasAnnotation = { 'data-sb-field-path'?: string };

type Props = HasAnnotation & {
  elementId?: string;
  className?: string;
  fields?: any[];
  submitLabel?: string;
  styles?: any;
};

function getUtmFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

function getNowTs(): number {
  return Date.now();
}

export default function FormBlock(props: Props) {
  const { elementId, className, fields = [], submitLabel, styles = {} } = props;

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [ts] = React.useState<number>(() => getNowTs()); // ✅ фиксируем timestamp на момент первого рендера

  if (!fields?.length) return null;

  // Отправляем ТОЛЬКО lead-form (чтобы services-note не улетал в базу)
  const shouldSubmitToApi = elementId === 'lead-form';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // Если это не lead-form — просто ничего не делаем (или можно показать "Ок")
    if (!shouldSubmitToApi) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current);
      const value = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

      const name = String(value.name ?? '').trim();
      const phone = String(value.phone ?? '').trim();
      const telegram = String(value.telegram ?? '').trim();
      const course = String(value.course ?? '').trim();
      const budget = String(value.budget ?? '').trim();

      // ✅ anti-bot: honeypot + timestamp
      const hp = String(value.company ?? '').trim();
      const tsFromForm = Number(value.ts ?? ts);

      // ✅ Правильная проверка consent
      // checkbox обычно даёт 'on', но на всякий случай считаем истинным любое непустое значение
      const consentRaw = formData.get('consent');
      const consent =
        consentRaw !== null &&
        String(consentRaw).trim() !== '' &&
        String(consentRaw) !== 'false' &&
        String(consentRaw) !== '0';

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
        consent,
        hp, // ✅ honeypot
        ts: tsFromForm, // ✅ timestamp
        source: 'site',
        utm: getUtmFromUrl()
      };

      const res = await fetch('/.netlify/functions/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(body?.error ? `Ошибка: ${body.error}` : 'Ошибка отправки заявки');
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

          {/* ✅ anti-bot: honeypot + timestamp */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <input type="hidden" name="ts" value={ts} />

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
