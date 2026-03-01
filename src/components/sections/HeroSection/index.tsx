import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { useRouter } from 'next/router';

import { AnnotatedField } from '@/components/Annotated';
import { Action } from '@/components/atoms';
import { DynamicComponent } from '@/components/components-registry';
import { HeroSection } from '@/types';
import { trackConversionEvent } from '@/utils/analytics';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

/*
 This is the only component in this codebase which has a few Stackbit annotations for specific primitive
 field. These are added by the <AnnotatedField> helper.
 The motivation for these annotations: allowing the content editor to edit styles at the field level.
 */
export default function Component(props: HeroSection) {
  const { elementId, colors, backgroundSize, title, subtitle, text, media, actions = [], styles = {} } = props;
  const router = useRouter();
  const lang = normalizeLanguage(router.query.lang);
  const localized = heroTranslations[lang];

  const resolvedTitle = title ? localized.title : title;
  const resolvedSubtitle = subtitle ? localized.subtitle : subtitle;
  const resolvedText = text ? localized.text : text;
  const resolvedActions = actions.map((action, index) => ({
    ...action,
    label: localized.actions[index] ?? action.label
  }));

  const sectionFlexDirection = styles.self?.flexDirection ?? 'row';
  const sectionAlign = styles.self?.textAlign ?? 'left';

  return (
    <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
      {/* Top content row (text + optional media) */}
      <div className={classNames('flex gap-8', mapFlexDirectionStyles(sectionFlexDirection))}>
        {/* Left column */}
        <div className={classNames('flex-1 w-full', mapStyles({ textAlign: sectionAlign }))}>
          {resolvedTitle && (
            <AnnotatedField path=".title">
              <h1
                className="
                  max-w-[20ch] text-[clamp(34px,8vw,60px)] font-semibold leading-[1.02]
                  [hyphens:none] [word-break:normal] [overflow-wrap:normal]
                  [text-wrap:balance]
                "
              >
                {resolvedTitle}
              </h1>
            </AnnotatedField>
          )}

          {resolvedSubtitle && (
            <AnnotatedField path=".subtitle">
              <Markdown
                options={{
                  forceBlock: true,
                  forceWrapper: true,
                  overrides: {
                    a: {
                      props: {
                        className: 'underline underline-offset-4 hover:opacity-80',
                        target: '_blank',
                        rel: 'noreferrer'
                      }
                    }
                  }
                }}
                className="mt-4 max-w-3xl text-lg leading-relaxed text-white/85 sm:text-xl"
              >
                {resolvedSubtitle}
              </Markdown>
            </AnnotatedField>
          )}

          {resolvedText && (
            <AnnotatedField path=".text">
              <Markdown
                options={{ forceBlock: true, forceWrapper: true }}
                className={classNames('max-w-2xl text-sm text-white/70 sm:text-base', {
                  'mt-4': !!resolvedTitle || !!resolvedSubtitle
                })}
              >
                {resolvedText}
              </Markdown>
            </AnnotatedField>
          )}

          {resolvedActions.length > 0 && (
            <div
              className={classNames('mt-8 flex flex-wrap items-center gap-3', {
                'justify-center': sectionAlign === 'center',
                'justify-end': sectionAlign === 'right'
              })}
            >
              {resolvedActions.map((action, index) => {
                const isSecondary = action.type === 'Button' && action.style === 'secondary';

                return (
                  <Action
                    key={index}
                    {...action}
                    className={classNames(
                      isSecondary
                        ? 'rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-base font-semibold normal-case tracking-normal text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                        : 'rounded-xl border border-transparent bg-violet-500 px-5 py-3 text-base font-semibold normal-case tracking-normal text-white shadow-lg shadow-violet-500/30 hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                    )}
                    onClick={() => {
                      const actionUrl = action.url || '';
                      const eventName =
                        index === 0
                          ? 'cta_primary_click'
                          : actionUrl.includes('wa.me')
                            ? 'messenger_whatsapp_click'
                            : actionUrl.includes('t.me')
                              ? 'messenger_telegram_click'
                              : 'cta_secondary_click';

                      trackConversionEvent(eventName, {
                        location: 'hero',
                        label: action.label,
                        url: actionUrl
                      });
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right column (only if media exists in content) */}
        {media && (
          <div
            className={classNames('flex flex-1 w-full', {
              'justify-center': sectionAlign === 'center',
              'justify-end': sectionAlign === 'right'
            })}
          >
            <DynamicComponent {...media} />
          </div>
        )}
      </div>

      {/* Value props (cards) */}
      <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">{t(lang, 'launchLabel')}</p>
          <p className="mt-2 text-xl font-semibold">{t(lang, 'launchValue')}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">{t(lang, 'clarityLabel')}</p>
          <p className="mt-2 text-xl font-semibold">{t(lang, 'clarityValue')}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">{t(lang, 'firstStepLabel')}</p>
          <p className="mt-2 text-xl font-semibold">{t(lang, 'firstStepValue')}</p>
        </div>
      </div>

      {/* FULL-BLEED HERO VIDEO (always shown, AFTER actions) */}
      <div className="mt-8 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="relative w-full overflow-hidden border-y border-white/10 bg-black/20">
          <div className="relative h-[440px] w-full sm:h-[600px] md:h-[840px] lg:h-[1040px]">
            <video
              className="absolute inset-0 h-full w-full object-contain"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero.png"
              aria-label="Превью процесса лидогенерации"
            >
              <source src="/hero.webm" type="video/webm" />
              <source src="/hero.mp4" type="video/mp4" />
            </video>

            <noscript>
              <img
                src="/hero.png"
                alt="Иллюстрация процесса лидогенерации"
                className="absolute inset-0 h-full w-full object-contain"
                loading="lazy"
              />
            </noscript>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
          </div>
        </div>
      </div>
    </Section>
  );
}


const heroTranslations = {
  ru: {
    title: 'Лидогенерация под ключ: реклама + аналитика + воронка продаж',
    subtitle:
      'Запускаем и ведём рекламные кампании, улучшаем конверсию посадочной страницы и настраиваем измеримую аналитику. Прогноз CPL за 24 часа после получения вводных: ниша, гео, бюджет, сайт/офер.',
    text: 'Обычно отвечаем в течение 15 минут в рабочее время. Без спама — только 3 уточняющих вопроса по нише, гео и бюджету.',
    actions: ['Получить аудит и план', 'Написать в Telegram', 'Написать в WhatsApp'],
    launchLabel: 'Срок запуска',
    launchValue: 'от 3–5 дней',
    clarityLabel: 'Прозрачность',
    clarityValue: 'дашборд по лидам и CPL',
    firstStepLabel: 'Первый шаг',
    firstStepValue: 'прогноз CPL за 24 часа после вводных'
  },
  en: {
    title: 'Turnkey lead generation: ads + analytics + sales funnel',
    subtitle:
      'We launch and manage ad campaigns, improve landing conversion, and set up measurable analytics. CPL forecast in 24 hours after we receive your brief: niche, geo, budget, website/offer.',
    text: 'We usually respond within 15 minutes during business hours. No spam — only 3 clarifying questions about niche, geo, and budget.',
    actions: ['Get audit and plan', 'Message us on Telegram', 'Message us on WhatsApp'],
    launchLabel: 'Launch timeline',
    launchValue: 'from 3–5 days',
    clarityLabel: 'Transparency',
    clarityValue: 'dashboard with leads and CPL',
    firstStepLabel: 'First step',
    firstStepValue: 'CPL forecast in 24h after your brief'
  },
  es: {
    title: 'Generación de leads llave en mano: ads + analítica + embudo de ventas',
    subtitle:
      'Lanzamos y gestionamos campañas, mejoramos la conversión de la landing y configuramos analítica medible. Pronóstico de CPL en 24 horas tras recibir el brief: nicho, geo, presupuesto y web/oferta.',
    text: 'Normalmente respondemos en 15 minutos en horario laboral. Sin spam: solo 3 preguntas de aclaración sobre nicho, geo y presupuesto.',
    actions: ['Obtener auditoría y plan', 'Escribir en Telegram', 'Escribir en WhatsApp'],
    launchLabel: 'Plazo de lanzamiento',
    launchValue: 'desde 3–5 días',
    clarityLabel: 'Transparencia',
    clarityValue: 'dashboard de leads y CPL',
    firstStepLabel: 'Primer paso',
    firstStepValue: 'pronóstico de CPL en 24h tras el brief'
  }
};

type Lang = keyof typeof heroTranslations;

function normalizeLanguage(value?: string | string[]): Lang {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === 'en' || v === 'es') return v;
  return 'ru';
}

function t(lang: Lang, key: keyof (typeof heroTranslations)['ru']) {
  return heroTranslations[lang][key];
}

function mapFlexDirectionStyles(flexDirection?: 'row' | 'row-reverse' | 'col' | 'col-reverse') {
  switch (flexDirection) {
    case 'row-reverse':
      return 'flex-col-reverse lg:flex-row-reverse lg:items-center';
    case 'col':
      return 'flex-col';
    case 'col-reverse':
      return 'flex-col-reverse';
    default:
      return 'flex-col lg:flex-row lg:items-center';
  }
}
