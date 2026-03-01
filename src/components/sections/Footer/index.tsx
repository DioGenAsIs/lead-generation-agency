import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { Action } from '@/components/atoms';

export default function Footer(props) {
    const { primaryLinks = [], contacts, copyrightText, styles = {} } = props;
    const router = useRouter();
    const lang = normalizeLanguage(router.query.lang);
    const localizedPrimaryLinks = useMemo(() => localizeLinks(primaryLinks, lang), [lang, primaryLinks]);
    const localizedContacts = useMemo(() => localizeContacts(contacts, lang), [contacts, lang]);
    const localizedCopyrightText = useMemo(() => localizeFooterText(copyrightText, lang), [copyrightText, lang]);
    const footerWidth = styles.self?.width ?? 'narrow';
    return (
        <footer className={classNames('relative', styles.self?.padding ?? 'py-16 px-4')}>
            <div
                className={classNames('border-t-2 border-current pt-8', {
                    'max-w-7xl mx-auto': footerWidth === 'narrow',
                    'max-w-8xl mx-auto': footerWidth === 'wide'
                })}
            >
                <div className="flex flex-col gap-x-12 gap-y-12 md:gap-y-32 md:flex-row md:flex-wrap md:justify-between">
                    {localizedPrimaryLinks.length > 0 && (
                        <div className={classNames(localizedContacts ? 'w-full' : 'md:mr-auto')}>
                            <ul className="flex flex-wrap max-w-5xl text-lg gap-x-8 gap-y-2">
                                {localizedPrimaryLinks.map((link, index) => (
                                    <li key={index}>
                                        <Action {...link} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {localizedContacts && <Contacts {...localizedContacts} />}
                    {/* Please keep this attribution up if you're using Stackbit's free plan. */}
                    {localizedCopyrightText && (
                        <div className={classNames(localizedPrimaryLinks.length > 0 || localizedContacts ? 'md:self-end' : null)}>
                            <Markdown
                                options={{ forceInline: true, forceWrapper: true, wrapper: 'p' }}
                                className="tracking-widest prose-sm prose uppercase"
                            >
                                {localizedCopyrightText}
                            </Markdown>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}

const supportedLanguages = ['ru', 'en', 'es'] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

const footerTranslations = {
    en: {
        'Услуги': 'Services',
        'Кейсы': 'Cases',
        'Оставить заявку': 'Leave a request',
        'Написать в Telegram': 'Write in Telegram',
        'Написать в WhatsApp': 'Write in WhatsApp',
        'Москва': 'Moscow',
        '© 2026 Lead Generation Agency. Все права защищены.': '© 2026 Lead Generation Agency. All rights reserved.'
    },
    es: {
        'Услуги': 'Servicios',
        'Кейсы': 'Casos',
        'Оставить заявку': 'Dejar solicitud',
        'Написать в Telegram': 'Escribir en Telegram',
        'Написать в WhatsApp': 'Escribir en WhatsApp',
        'Москва': 'Moscú',
        '© 2026 Lead Generation Agency. Все права защищены.': '© 2026 Lead Generation Agency. Todos los derechos reservados.'
    }
} as const;

function normalizeLanguage(value?: string | string[]): SupportedLanguage {
    const v = Array.isArray(value) ? value[0] : value;
    if (v && supportedLanguages.includes(v as SupportedLanguage)) {
        return v as SupportedLanguage;
    }
    return 'ru';
}

function localizeFooterText(value: string | undefined, lang: SupportedLanguage) {
    if (!value || lang === 'ru') {
        return value;
    }

    return footerTranslations[lang]?.[value] ?? value;
}

function localizeLinks<T extends { label?: string; altText?: string }>(links: T[], lang: SupportedLanguage): T[] {
    if (lang === 'ru') {
        return links;
    }

    return links.map((link) => {
        const translatedLabel = localizeFooterText(link.label, lang);
        if (!translatedLabel || translatedLabel === link.label) {
            return link;
        }

        return {
            ...link,
            label: translatedLabel,
            altText: localizeFooterText(link.altText, lang) || translatedLabel
        };
    });
}

function localizeContacts<T extends { address?: string; addressAltText?: string }>(contacts: T | undefined, lang: SupportedLanguage) {
    if (!contacts || lang === 'ru') {
        return contacts;
    }

    return {
        ...contacts,
        address: localizeFooterText(contacts.address, lang),
        addressAltText: localizeFooterText(contacts.addressAltText, lang) || contacts.addressAltText
    };
}

function Contacts(props) {
    const { phoneNumber, phoneAltText, email, emailAltText, address, addressAltText, elementId } = props;
    return (
        <div id={elementId || null} className="max-w-3xl prose sm:prose-lg">
            {phoneNumber && (
                <p>
                    <a href={`tel:${phoneNumber}`} aria-label={phoneAltText}>
                        {phoneNumber}
                    </a>
                </p>
            )}
            {email && (
                <p>
                    <a href={`mailto:${email}`} aria-label={emailAltText}>
                        {email}
                    </a>
                </p>
            )}
            {address && (
                <p>
                    <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
                        aria-label={addressAltText}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {address}
                    </a>
                </p>
            )}
        </div>
    );
}
