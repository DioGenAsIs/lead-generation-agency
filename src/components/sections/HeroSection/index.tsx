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
      <div className={classNames('flex gap-8', mapFlexDirectionStyles(sectionFlexDirection))}>
        <div className={classNames('flex-1 w-full', mapStyles({ textAlign: sectionAlign }))}>
          {title && (
            <AnnotatedField path=".title">
              <h1 className="text-5xl sm:text-6xl">{title}</h1>
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

        {media && (
          <div
            className={classNames('flex flex-1 w-full', {
              'justify-center': sectionAlign === 'center',
              'justify-end': sectionAlign === 'right'
            })}
          >
            <HeroMedia media={media} />
          </div>
        )}
      </div>
    </Section>
  );
}

function HeroMedia({ media }) {
  // Если хочешь всегда показывать видео — просто return VideoHero()
  // Если хочешь показывать видео только когда media есть — оставь как ниже.
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-black/20">
      <div className="relative aspect-[16/9] w-full">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/hero.png"
        >
          <source src="/hero.webm" type="video/webm" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* лёгкое затемнение/читабельность */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
      </div>
    </div>
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
