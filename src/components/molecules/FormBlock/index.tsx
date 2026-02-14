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

function digitsCount(s: string) {
  return (s.match(/\d/g) || []).length;
}

export default function FormBlock(props: Props) {
  const { elementId = '', className, fields = [], submitLabel = 'Отправить', styles = {} } = props;

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const tsRef = React.useRef<number>(Date.now()); // ставим на загрузке компонента

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!fields?.length) return null;

  const isLeadForm = elementId === 'lead-form'; // в content/pages/index.md elementId: lead-form

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // Для НЕ-лидовых форм — просто “Ок”
    if (!isLeadForm) {
      alert('Ок ✅');
      formRef.current.reset();
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData(formRef.current);
      const value = Object.fromEntries(data.entries());

      const name = String(value.name || '').trim();
      const phone = String(value.phone || '').trim();
      const telegram = String(value.telegram || '').trim();
      const whatsapp = String(value.whatsapp || '').trim();
      const website = String(value.website || '').trim(); // вместо course/ниша
      const budget = String(value.budget || '').trim();

      const consentChecked = String(value.consent || '') === 'on';

      // ✅ Валидация по требованиям
      if (!name) {
        alert('Укажите имя');
        return;
      }

      if (!phone || digitsCount(phone) < 6) {
        alert('Укажите телефон');
        return;
      }

      if (!telegram && !whatsapp) {
        alert('Укажите Telegram или WhatsApp — любой один способ связи');
        return;
      }

      if (!consentChecked) {
        alert('Нужно согласие на обработку данных');
        return;
      }

      const payload = {
        name,
        phone,
        telegram,
        whatsapp,
        website,
        budget,
        consent: true, // отправляем как факт, но не храним в БД
        source: 'site',
        utm: getUtmFromUrl(),
        hp: String(value.hp || '').trim(), // honeypot
        ts: tsRef.current // время с загрузки страницы
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
      tsRef.current = Date.now(); // на случай повторной заявки
    } catch (err: any) {
      alert(`Ошибка: ${err?.message || 'что-то пошло не так'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Annotated content={props as any}>
      <form className={className} name={elementId} id={elementId} onSubmit={handleSubmit} ref={formRef}>
        <div className="grid gap-6 sm:grid-cols-2">
          <input type="hidden" name="form-name" value={elementId} />

          {/* honeypot поле (невидимое) */}
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          {fields.map((field, idx) => (
            <DynamicComponent key={idx} {...field} />
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
