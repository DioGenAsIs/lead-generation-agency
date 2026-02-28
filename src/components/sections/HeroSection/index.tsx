import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { AnnotatedField } from '@/components/Annotated';
import { Action } from '@/components/atoms';
import { DynamicComponent } from '@/components/components-registry';
import { HeroSection } from '@/types';
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
                  text-[clamp(36px,9vw,64px)] leading-[0.95]
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
                className={classNames('text-xl sm:text-2xl', { 'mt-4': !!title })}
              >
                {subtitle}
              </Markdown>
            </AnnotatedField>
          )}

          {text && (
            <AnnotatedField path=".text">
              <Markdown
                options={{ forceBlock: true, forceWrapper: true }}
                className={classNames('max-w-none prose sm:prose-lg', { 'mt-6': !!title || !!subtitle })}
              >
                {text}
              </Markdown>
            </AnnotatedField>
          )}

          {/* Actions ("Оставить заявку") */}
          {actions?.length > 0 && (
            <div
              className={classNames('flex flex-wrap items-center gap-4', {
                'mt-8': !!title || !!subtitle || !!text,
                'justify-center': sectionAlign === 'center',
                'justify-end': sectionAlign === 'right'
              })}
            >
              {actions.map((action, index) => (
                <Action key={index} {...action} />
              ))}
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

      {/* HERO VIDEO (container width, AFTER actions) */}
      <div className="mt-8">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          {/* Height controls across devices */}
          <div className="relative h-[220px] sm:h-[300px] md:h-[420px] lg:h-[520px] w-full">
            <video
              className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/hero.png"
            >
              <source src="/hero.webm" type="video/webm" />
              <source src="/hero.mp4" type="video/mp4" />
            </video>

            {/* subtle overlay for readability / nicer look */}
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
