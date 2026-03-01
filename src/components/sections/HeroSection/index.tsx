import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

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

  const sectionFlexDirection = styles.self?.flexDirection ?? 'row';
  const sectionAlign = styles.self?.textAlign ?? 'left';

  return (
    <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
      {/* Top content row (text + optional media) */}
      <div className={classNames('flex gap-8', mapFlexDirectionStyles(sectionFlexDirection))}>
        {/* Left column */}
        <div className={classNames('flex-1 w-full', mapStyles({ textAlign: sectionAlign }))}>
          {title && (
            <AnnotatedField path=".title">
              <h1
                className="
                  max-w-[20ch] text-[clamp(34px,8vw,60px)] font-semibold leading-[1.02]
                  [hyphens:none] [word-break:normal] [overflow-wrap:normal]
                  [text-wrap:balance]
                "
              >
                {title}
              </h1>
            </AnnotatedField>
          )}

          {subtitle && (
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
                {subtitle}
              </Markdown>
            </AnnotatedField>
          )}

          {text && (
            <AnnotatedField path=".text">
              <Markdown
                options={{ forceBlock: true, forceWrapper: true }}
                className={classNames('max-w-2xl text-sm text-white/70 sm:text-base', {
                  'mt-4': !!title || !!subtitle
                })}
              >
                {text}
              </Markdown>
            </AnnotatedField>
          )}

          {actions.length > 0 && (
            <div
              className={classNames('mt-8 flex flex-wrap items-center gap-3', {
                'justify-center': sectionAlign === 'center',
                'justify-end': sectionAlign === 'right'
              })}
            >
              {actions.map((action, index) => {
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
                    onClick={() =>
                      trackConversionEvent(index === 0 ? 'cta_primary_click' : 'messenger_telegram_click', {
                        location: 'hero',
                        label: action.label
                      })
                    }
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
          <p className="text-xs uppercase tracking-wide text-white/60">Срок запуска</p>
          <p className="mt-2 text-xl font-semibold">от 3–5 дней</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Прозрачность</p>
          <p className="mt-2 text-xl font-semibold">дашборд по лидам и CPL</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Первый шаг</p>
          <p className="mt-2 text-xl font-semibold">аудит + план за 24 часа</p>
        </div>
      </div>

      {/* FULL-BLEED HERO VIDEO (always shown, AFTER actions) */}
      <div className="mt-8 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="relative w-full overflow-hidden border-y border-white/10 bg-black/20">
          <div className="relative h-[220px] w-full sm:h-[300px] md:h-[420px] lg:h-[520px]">
            <video
              className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
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
                className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
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
