import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import { Link, Social } from '@/components/atoms';
import ImageBlock from '@/components/molecules/ImageBlock';
import CloseIcon from '@/components/svgs/close';
import MenuIcon from '@/components/svgs/menu';
import { trackConversionEvent } from '@/utils/analytics';
import HeaderLink from './HeaderLink';

const supportedLanguages = ['ru', 'en', 'es'] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function normalizeLanguage(value?: string | string[]): SupportedLanguage {
  const v = Array.isArray(value) ? value[0] : value;
  if (v && supportedLanguages.includes(v as SupportedLanguage)) {
    return v as SupportedLanguage;
  }
  return 'ru';
}

export default function Header(props) {
  const { isSticky, styles = {}, ...rest } = props;
  const headerWidth = styles.self?.width ?? 'narrow';

  return (
    <header
      className={classNames(
        isSticky ? 'sticky top-0 z-50' : 'relative',
        'border-b border-white/10',
        'bg-black/35 backdrop-blur-md supports-[backdrop-filter]:bg-black/25'
      )}
    >
      <div
        className={classNames({
          'max-w-7xl mx-auto xl:border-x xl:border-white/10': headerWidth === 'narrow',
          'max-w-8xl mx-auto 2xl:border-x 2xl:border-white/10': headerWidth === 'wide',
          'w-full': headerWidth === 'full'
        })}
      >
        <Link href="#main" className="sr-only">
          Skip to main content
        </Link>
        <HeaderVariants {...rest} />
      </div>
    </header>
  );
}

function HeaderVariants(props) {
  const { headerVariant = 'variant-a', ...rest } = props;
  switch (headerVariant) {
    case 'variant-b':
      return <HeaderVariantB {...rest} />;
    case 'variant-c':
      return <HeaderVariantC {...rest} />;
    default:
      return <HeaderVariantA {...rest} />;
  }
}

function HeaderVariantA(props) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;

  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />

      {primaryLinks.length > 0 && (
        <ul className="hidden border-r border-white/10 divide-x divide-white/10 lg:flex">
          <ListOfLinks links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}

      <LanguageSwitcher />

      {/* Desktop socials */}
      {socialLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-white/10 lg:flex">
          <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
        </ul>
      )}

      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function HeaderVariantB(props) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;

  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />

      {primaryLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-white/10 divide-x divide-white/10 lg:flex">
          <ListOfLinks links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}

      <LanguageSwitcher />

      {/* Desktop socials */}
      {socialLinks.length > 0 && (
        <ul
          className={classNames('hidden border-l border-white/10 lg:flex', {
            'ml-auto': primaryLinks.length === 0
          })}
        >
          <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
        </ul>
      )}

      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function HeaderVariantC(props) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;

  return (
    <div className="relative flex items-stretch">
      <SiteLogoLink {...logoProps} />

      <LanguageSwitcher />

      {/* Desktop socials */}
      {socialLinks.length > 0 && (
        <ul className="hidden ml-auto border-l border-white/10 lg:flex">
          <ListOfSocialLinks links={socialLinks} inMobileMenu={false} />
        </ul>
      )}

      {primaryLinks.length > 0 && (
        <ul
          className={classNames('hidden border-l border-white/10 divide-x divide-white/10 lg:flex', {
            'ml-auto': primaryLinks.length === 0
          })}
        >
          <ListOfLinks links={primaryLinks} inMobileMenu={false} />
        </ul>
      )}

      {(primaryLinks.length > 0 || socialLinks.length > 0) && <MobileMenu {...props} />}
    </div>
  );
}

function MobileMenu(props) {
  const { primaryLinks = [], socialLinks = [], ...logoProps } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  return (
    <div className="ml-auto flex items-stretch lg:hidden">
      {/* MOBILE socials always visible in header (left of burger) */}
      {socialLinks.length > 0 && (
        <div className="flex items-stretch border-l border-white/10">
          {socialLinks.map((link, index) => (
            <Social
              key={index}
              {...link}
              className="text-white inline-flex items-center justify-center w-12 h-12 link-fill hover:bg-white/10 transition"
              onClick={() => trackSocialClick(link, 'header_mobile')}
            />
          ))}
        </div>
      )}

      {/* Burger */}
      <button
        aria-label="Open Menu"
        className="h-10 min-h-full p-4 text-lg border-l border-white/10 focus:outline-hidden"
        onClick={() => setIsMenuOpen(true)}
      >
        <MenuIcon className="fill-current w-icon h-icon" />
      </button>

      {/* Overlay menu */}
      <div className={classNames('fixed inset-0 z-20 overflow-y-auto bg-main', isMenuOpen ? 'block' : 'hidden')}>
        <div className="flex flex-col min-h-full">
          <div className="flex items-stretch justify-between border-b border-white/10">
            <SiteLogoLink {...logoProps} />

            <div className="border-l border-white/10">
              <button
                aria-label="Close Menu"
                className="h-10 min-h-full p-4 text-lg focus:outline-hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <CloseIcon className="fill-current w-icon h-icon" />
              </button>
            </div>
          </div>

          {(primaryLinks.length > 0 || socialLinks.length > 0) && (
            <div className="flex flex-col items-center justify-center px-4 py-20 space-y-12 grow">
              <LanguageSwitcher isMobile />

              {primaryLinks.length > 0 && (
                <ul className="space-y-6">
                  <ListOfLinks links={primaryLinks} inMobileMenu={true} />
                </ul>
              )}

              {socialLinks.length > 0 && (
                <ul className="flex flex-wrap justify-center border border-white/10 divide-x divide-white/10">
                  <ListOfSocialLinks links={socialLinks} inMobileMenu={true} />
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LanguageSwitcher({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const currentLang = useMemo(() => normalizeLanguage(router.query.lang), [router.query.lang]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = normalizeLanguage(window.localStorage.getItem('site_lang') || undefined);
      if (!router.query.lang && saved !== currentLang) {
        router.replace(
          { pathname: router.pathname, query: { ...router.query, lang: saved }, hash: window.location.hash.slice(1) || undefined },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [currentLang, router]);

  return (
    <div
      className={classNames('hidden lg:flex items-center border-l border-white/10 px-3', {
        'lg:hidden flex': isMobile
      })}
    >
      <label htmlFor={isMobile ? 'lang-mobile' : 'lang-desktop'} className="sr-only">
        Language
      </label>
      <select
        id={isMobile ? 'lang-mobile' : 'lang-desktop'}
        className="rounded-md border border-white/20 bg-black/30 px-2 py-1 text-xs uppercase tracking-widest"
        value={currentLang}
        onChange={(e) => {
          const lang = normalizeLanguage(e.target.value);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('site_lang', lang);
          }
          trackConversionEvent('language_switch', { language: lang, location: isMobile ? 'mobile_menu' : 'header' });
          router.push(
            {
              pathname: router.pathname,
              query: { ...router.query, lang }
            },
            undefined,
            { shallow: true }
          );
        }}
      >
        <option value="ru">RU</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </div>
  );
}

function SiteLogoLink({ title, isTitleVisible, logo }) {
  if (!(logo || (title && isTitleVisible))) return null;

  return (
    <div className="flex items-center border-r border-white/10">
      <Link href="/" className="flex items-center h-full gap-2 p-4 link-fill">
        {logo && <ImageBlock {...logo} className="max-h-12" />}
        {title && isTitleVisible && <span className="text-base tracking-widest uppercase">{title}</span>}
      </Link>
    </div>
  );
}

function ListOfLinks({ links, inMobileMenu }) {
  return links.map((link, index) => (
    <li key={index} className={classNames(inMobileMenu ? 'text-center w-full' : 'inline-flex items-stretch')}>
      <HeaderLink
        {...link}
        onClick={() =>
          trackConversionEvent('nav_click', {
            location: inMobileMenu ? 'mobile_menu' : 'header',
            label: link.label || '',
            url: link.url || ''
          })
        }
        className={classNames(inMobileMenu ? 'text-xl bottom-shadow-1 hover:bottom-shadow-5' : 'p-4 link-fill')}
      />
    </li>
  ));
}

function ListOfSocialLinks({ links, inMobileMenu = false }) {
  return links.map((link, index) => (
    <li key={index} className="inline-flex items-stretch">
      <Social
        {...link}
        onClick={() => trackSocialClick(link, inMobileMenu ? 'mobile_menu' : 'header')}
        className={classNames(
          'text-white inline-flex items-center justify-center',
          inMobileMenu ? 'p-5 link-fill' : 'w-12 h-12 p-0 link-fill hover:bg-white/10 transition'
        )}
      />
    </li>
  ));
}

function trackSocialClick(link, location: string) {
  const eventNameByIcon = {
    telegram: 'messenger_telegram_click',
    whatsapp: 'messenger_whatsapp_click'
  };

  trackConversionEvent(eventNameByIcon[link.icon] || 'social_click', {
    location,
    label: link.label || '',
    url: link.url || '',
    icon: link.icon || ''
  });
}
