import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { useRouter } from 'next/router';

import { DynamicComponent } from '@/components/components-registry';
import FormBlock from '@/components/molecules/FormBlock';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

export default function ContactSection(props) {
    const { elementId, colors, backgroundSize, title, text, form, media, styles = {} } = props;
    const router = useRouter();
    const lang = normalizeLanguage(router.query.lang);
    const localizedContent = getLocalizedContactContent(elementId, lang);

    const resolvedTitle = localizedContent?.title ?? title;
    const sectionAlign = styles.self?.textAlign ?? 'left';
    return (
        <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
            <div className={classNames('flex gap-8', mapFlexDirectionStyles(styles.self?.flexDirection ?? 'row'))}>
                <div className="flex-1 w-full">
                    {resolvedTitle && (
                        <h2 className={classNames('text-4xl sm:text-5xl', mapStyles({ textAlign: sectionAlign }))}>
                            {resolvedTitle}
                        </h2>
                    )}
                    {text && (
                        <Markdown
                            options={{ forceBlock: true, forceWrapper: true }}
                            className={classNames(
                                'max-w-none prose sm:prose-lg',
                                mapStyles({ textAlign: sectionAlign }),
                                {
                                    'mt-4': title
                                }
                            )}
                        >
                            {text}
                        </Markdown>
                    )}
                    {form && <FormBlock {...form} className={classNames({ 'mt-12': title || text })} />}
                </div>
                {media && (
                    <div
                        className={classNames('flex flex-1 w-full', {
                            'justify-center': sectionAlign === 'center',
                            'justify-end': sectionAlign === 'right'
                        })}
                    >
                        <ContactMedia media={media} />
                    </div>
                )}
            </div>
        </Section>
    );
}

const supportedLanguages = ['ru', 'en', 'es'] as const;
type Lang = (typeof supportedLanguages)[number];

const contactContentTranslations = {
    lead: {
        en: {
            title: 'Leave a request'
        },
        es: {
            title: 'Enviar solicitud'
        }
    }
} as const;

function normalizeLanguage(value?: string | string[]): Lang {
    const v = Array.isArray(value) ? value[0] : value;
    if (v && supportedLanguages.includes(v as Lang)) {
        return v as Lang;
    }
    return 'ru';
}

function getLocalizedContactContent(elementId: string | undefined, lang: Lang) {
    if (!elementId || lang === 'ru') {
        return null;
    }

    return contactContentTranslations[elementId]?.[lang] ?? null;
}

function ContactMedia({ media }) {
    return <DynamicComponent {...media} />;
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
