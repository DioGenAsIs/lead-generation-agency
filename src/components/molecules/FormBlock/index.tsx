import classNames from 'classnames';
import * as React from 'react';
import { useRouter } from 'next/router';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import { trackConversionEvent } from '@/utils/analytics';


const formTranslations = {
  ru: {
    ok: 'Ок ✅',
    nameRequired: 'Укажите имя',
    phoneRequired: 'Укажите телефон',
    contactRequired: 'Укажите Telegram или WhatsApp — любой один способ связи',
    consentRequired: 'Нужно согласие на обработку данных',
    submitError: 'Ошибка отправки заявки',
    submitSuccess: 'Заявка отправлена 🚀',
    submitting: 'Отправляем…',
    errorPrefix: 'Ошибка',
    somethingWrong: 'что-то пошло не так'
  },
  en: {
    ok: 'Done ✅',
    nameRequired: 'Please enter your name',
    phoneRequired: 'Please enter your phone number',
    contactRequired: 'Provide Telegram or WhatsApp — at least one contact method',
    consentRequired: 'Consent to personal data processing is required',
    submitError: 'Submission failed',
    submitSuccess: 'Request sent 🚀',
    submitting: 'Sending…',
    errorPrefix: 'Error',
    somethingWrong: 'something went wrong'
  },
  es: {
    ok: 'Listo ✅',
    nameRequired: 'Indica tu nombre',
    phoneRequired: 'Indica tu teléfono',
    contactRequired: 'Indica Telegram o WhatsApp — al menos un canal de contacto',
    consentRequired: 'Se requiere consentimiento para el tratamiento de datos',
    submitError: 'Error al enviar la solicitud',
    submitSuccess: 'Solicitud enviada 🚀',
    submitting: 'Enviando…',
    errorPrefix: 'Error',
    somethingWrong: 'algo salió mal'
  }
};

type Lang = keyof typeof formTranslations;
const supportedLanguages: Lang[] = ['ru', 'en', 'es'];

const formContentTranslations = {
  en: {
    'Имя': 'Name',
    'Имя (обязательно)': 'Name (required)',
    'Телефон': 'Phone',
    'Телефон (обязательно)': 'Phone (required)',
    'Telegram @username (если нет WhatsApp)': 'Telegram @username (if no WhatsApp)',
    'WhatsApp (номер, если нет Telegram)': 'WhatsApp (number, if no Telegram)',
    'Ссылка на сайт': 'Website URL',
    'Ссылка на сайт (опционально)': 'Website URL (optional)',
    'Бюджет': 'Budget',
    'Бюджет в день (опционально)': 'Daily budget (optional)',
    'Согласен на обработку персональных данных': 'I agree to the processing of personal data',
    'Отправить заявку 🚀': 'Send request 🚀',
    'Отправить': 'Send'
  },
  es: {
    'Имя': 'Nombre',
    'Имя (обязательно)': 'Nombre (obligatorio)',
    'Телефон': 'Teléfono',
    'Телефон (обязательно)': 'Teléfono (obligatorio)',
    'Telegram @username (если нет WhatsApp)': 'Telegram @usuario (si no tienes WhatsApp)',
    'WhatsApp (номер, если нет Telegram)': 'WhatsApp (número, si no tienes Telegram)',
    'Ссылка на сайт': 'Enlace del sitio',
    'Ссылка на сайт (опционально)': 'Enlace del sitio (opcional)',
    'Бюджет': 'Presupuesto',
    'Бюджет в день (опционально)': 'Presupuesto diario (opcional)',
    'Согласен на обработку персональных данных': 'Acepto el tratamiento de datos personales',
    'Отправить заявку 🚀': 'Enviar solicitud 🚀',
    'Отправить': 'Enviar'
  }
} as const;

type ContentLang = keyof typeof formContentTranslations;

function normalizeLanguage(value?: string | string[]): Lang {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return 'ru';
  const normalized = v.toLowerCase().split('-')[0] as Lang;
  if (supportedLanguages.includes(normalized)) return normalized;
  return 'ru';
}

function detectDefaultLanguage(): Lang {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const saved = normalizeLanguage(window.localStorage.getItem('site_lang') || undefined);
  if (saved !== 'ru' || window.localStorage.getItem('site_lang') === 'ru') {
    return saved;
  }

  const browserLanguages = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language];

  for (const browserLanguage of browserLanguages) {
    const detected = normalizeLanguage(browserLanguage);
    if (detected !== 'ru' || browserLanguage?.toLowerCase().startsWith('ru')) {
      return detected;
    }
  }

  return 'ru';
}

function translateFormContent(lang: Lang, value: string | undefined) {
  if (!value || lang === 'ru') {
    return value;
  }

  const contentLang = lang as ContentLang;
  return formContentTranslations[contentLang]?.[value as keyof (typeof formContentTranslations)['en']] ?? value;
}

function tr(lang: Lang, key: keyof (typeof formTranslations)['ru']) {
  return formTranslations[lang][key];
}

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

  const router = useRouter();
  const [fallbackLang, setFallbackLang] = React.useState<Lang>('ru');

  React.useEffect(() => {
    setFallbackLang(detectDefaultLanguage());
  }, []);

  const lang = router.query.lang ? normalizeLanguage(router.query.lang) : fallbackLang;
  const localizedFields = React.useMemo(
    () =>
      fields.map((field) => ({
        ...field,
        label: translateFormContent(lang, field.label),
        placeholder: translateFormContent(lang, field.placeholder)
      })),
    [fields, lang]
  );

  const localizedSubmitLabel = translateFormContent(lang, submitLabel) || submitLabel;

  const formRef = React.useRef<HTMLFormElement | null>(null);
  const tsRef = React.useRef<number>(Date.now()); // ставим на загрузке компонента
  const formStartTrackedRef = React.useRef(false);
  const formViewedTrackedRef = React.useRef(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const hasFields = Boolean(fields?.length);

  const isLeadForm = elementId === 'lead-form'; // в content/pages/index.md elementId: lead-form

  React.useEffect(() => {
    if (!isLeadForm || !formRef.current || formViewedTrackedRef.current || typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !formViewedTrackedRef.current) {
          trackConversionEvent('lead_form_view', { location: elementId });
          formViewedTrackedRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(formRef.current);

    return () => observer.disconnect();
  }, [elementId, isLeadForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current || isSubmitting) return;

    // Для НЕ-лидовых форм — просто “Ок”
    if (!isLeadForm) {
      alert(tr(lang, 'ok'));
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
        alert(tr(lang, 'nameRequired'));
        return;
      }

      if (!phone || digitsCount(phone) < 6) {
        alert(tr(lang, 'phoneRequired'));
        return;
      }

      if (!telegram && !whatsapp) {
        alert(tr(lang, 'contactRequired'));
        return;
      }

      if (!consentChecked) {
        alert(tr(lang, 'consentRequired'));
        return;
      }

      const ageMs = Date.now() - tsRef.current;
      if (ageMs < 1500) {
        trackConversionEvent('bot_blocked', { location: elementId, reason: 'too_fast_client' });
        alert(tr(lang, 'submitError'));
        return;
      }

      const messengerChosen = telegram && whatsapp ? 'both' : telegram ? 'telegram' : 'whatsapp';
      trackConversionEvent('messenger_chosen', { location: elementId, messenger: messengerChosen });

      if (budget) {
        trackConversionEvent('budget_filled', { location: elementId });
      }

      if (website) {
        trackConversionEvent('website_filled', { location: elementId });
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

      const result = await res.json().catch(() => ({}));

      if (result?.botBlocked) {
        trackConversionEvent('bot_blocked', { location: elementId, reason: String(result?.reason || 'server_antibot') });
        return;
      }

      if (!res.ok || !result?.ok) {
        trackConversionEvent('lead_error', { location: elementId, reason: String(result?.error || 'request_failed') });
        alert(result?.error ? `${tr(lang, 'errorPrefix')}: ${result.error}` : tr(lang, 'submitError'));
        return;
      }

      trackConversionEvent('lead_success', { location: elementId });
      alert(tr(lang, 'submitSuccess'));
      formRef.current.reset();
      tsRef.current = Date.now(); // на случай повторной заявки
      formStartTrackedRef.current = false;
    } catch (err: any) {
      trackConversionEvent('lead_error', { location: elementId, reason: String(err?.message || 'unknown_error') });
      alert(`${tr(lang, 'errorPrefix')}: ${err?.message || tr(lang, 'somethingWrong')}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasFields) return null;

  return (
    <Annotated content={props as any}>
      <form
        className={className}
        name={elementId}
        id={elementId}
        onSubmit={handleSubmit}
        ref={formRef}
        onInput={() => {
          if (isLeadForm && !formStartTrackedRef.current) {
            trackConversionEvent('lead_form_start', { location: elementId });
            formStartTrackedRef.current = true;
          }
        }}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <input type="hidden" name="form-name" value={elementId} />

          {/* honeypot поле (невидимое) */}
          <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          {localizedFields.map((field, idx) => (
            <DynamicComponent key={idx} {...field} />
          ))}
        </div>

        <div className={classNames('mt-8', mapStyles({ textAlign: styles?.self?.textAlign ?? 'left' }))}>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              if (isLeadForm) {
                trackConversionEvent('lead_form_submit', { location: elementId });
              }
            }}
            className={classNames(
              'inline-flex items-center justify-center rounded-xl border border-transparent bg-violet-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              isSubmitting && 'cursor-not-allowed opacity-60'
            )}
          >
            {isSubmitting ? tr(lang, 'submitting') : localizedSubmitLabel}
          </button>
        </div>
      </form>
    </Annotated>
  );
}
