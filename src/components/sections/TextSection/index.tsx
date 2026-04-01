import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { useRouter } from 'next/router';

import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

const textSectionTranslations = {
    services: {
        en: {
            title: 'Services',
            subtitle: 'What we do for your lead-generation goals',
            text: `- Find growth points and audit the funnel.
- Launch performance ads and test hypotheses.
- Set up end-to-end analytics, lead reports, and CPL tracking.
- Optimize landing pages and lead qualification.`
        },
        es: {
            title: 'Servicios',
            subtitle: 'Qué hacemos para tu objetivo de generación de leads',
            text: `- Buscamos puntos de crecimiento y auditamos el embudo.
- Lanzamos publicidad de performance y probamos hipótesis.
- Configuramos analítica de extremo a extremo, reportes de leads y CPL.
- Optimizamos landing pages y la calificación de solicitudes.`
        }
    },

    'services-page': {
        en: {
            title: 'Services',
            subtitle: 'What we do for your lead-generation goals',
            text: `- Find growth points and audit the funnel.
- Launch performance ads and test hypotheses.
- Set up end-to-end analytics, lead reports, and CPL tracking.
- Optimize landing pages and lead qualification.

[Leave a request](/#lead)`
        },
        es: {
            title: 'Servicios',
            subtitle: 'Qué hacemos para tu objetivo de generación de leads',
            text: `- Buscamos puntos de crecimiento y auditamos el embudo.
- Lanzamos publicidad de performance y probamos hipótesis.
- Configuramos analítica de extremo a extremo, reportes de leads y CPL.
- Optimizamos landing pages y la calificación de solicitudes.

[Dejar solicitud](/#lead)`
        }
    },
    cases: {
        en: {
            title: 'Cases',
            subtitle: 'Examples of scenarios we run',
            text: `- B2B SaaS: reduced CPL by 32% in 6 weeks.
- Education: increased the share of qualified leads from 41% to 63%.
- Manufacturing: set up an inbound lead flow across 3 geos with one dashboard.`
        },
        es: {
            title: 'Casos',
            subtitle: 'Ejemplos de escenarios que gestionamos',
            text: `- B2B SaaS: redujimos el CPL en 32% en 6 semanas.
- Educación: aumentamos la proporción de leads calificados del 41% al 63%.
- Manufactura: configuramos un flujo de solicitudes en 3 regiones con un dashboard único.`
        }
    },

    'cases-page': {
        en: {
            title: 'Cases',
            subtitle: 'Examples of scenarios we run',
            text: `- B2B SaaS: reduced CPL by 32% in 6 weeks.
- Education: increased the share of qualified leads from 41% to 63%.
- Manufacturing: set up an inbound lead flow across 3 geos with one dashboard.

[Discuss a similar project](/#lead)`
        },
        es: {
            title: 'Casos',
            subtitle: 'Ejemplos de escenarios que gestionamos',
            text: `- B2B SaaS: redujimos el CPL en 32% en 6 semanas.
- Educación: aumentamos la proporción de leads calificados del 41% al 63%.
- Manufactura: configuramos un flujo de solicitudes en 3 regiones con un dashboard único.

[Hablar de un proyecto similar](/#lead)`
        }
    }
} as const;

type SupportedLanguage = 'ru' | 'en' | 'es';

function normalizeLanguage(value?: string | string[]): SupportedLanguage {
    const v = Array.isArray(value) ? value[0] : value;
    if (v === 'en' || v === 'es') return v;
    return 'ru';
}

export default function TextSection(props) {
    const { elementId, colors, variant = 'variant-a', styles = {}, ...rest } = props;
    const router = useRouter();
    const lang = normalizeLanguage(router.query.lang);
    const localizedSection = elementId && lang !== 'ru' ? textSectionTranslations[elementId]?.[lang] : null;

    const sectionAlign = styles.self?.textAlign ?? 'left';
    const resolvedProps = {
        ...rest,
        title: localizedSection?.title ?? rest.title,
        subtitle: localizedSection?.subtitle ?? rest.subtitle,
        text: localizedSection?.text ?? rest.text
    };

    return (
        <Section elementId={elementId} colors={colors} styles={styles.self}>
            {variant === 'variant-b' ? (
                <TextTwoCol {...resolvedProps} align={sectionAlign} />
            ) : (
                <TextOneCol {...resolvedProps} align={sectionAlign} />
            )}
        </Section>
    );
}

function TextOneCol(props) {
    const { title, subtitle, text, align } = props;
    return (
        <div className={classNames(mapStyles({ textAlign: align }))}>
            {title && <h2 className="text-4xl sm:text-5xl">{title}</h2>}
            {subtitle && <p className={classNames('text-xl sm:text-2xl', { 'mt-2': title })}>{subtitle}</p>}
            {text && (
                <Markdown
                    options={{ forceBlock: true, forceWrapper: true }}
                    className={classNames('max-w-none prose sm:prose-lg', {
                        'mt-6': title || subtitle
                    })}
                >
                    {text}
                </Markdown>
            )}
        </div>
    );
}

function TextTwoCol(props) {
    const { title, subtitle, text, align } = props;
    return (
        <div className={classNames('flex flex-wrap gap-6', mapStyles({ textAlign: align }))}>
            {(title || subtitle) && (
                <div className={classNames('w-full', { 'lg:flex-1': text })}>
                    {title && <h2 className="text-4xl sm:text-5xl">{title}</h2>}
                    {subtitle && <p className={classNames('text-xl sm:text-2xl', { 'mt-2': title })}>{subtitle}</p>}
                </div>
            )}
            {text && (
                <div className={classNames('w-full', { 'lg:flex-2': title || subtitle })}>
                    <Markdown
                        options={{ forceBlock: true, forceWrapper: true }}
                        className="prose max-w-none sm:prose-lg"
                    >
                        {text}
                    </Markdown>
                </div>
            )}
        </div>
    );
}
