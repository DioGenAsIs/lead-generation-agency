import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Link, Social } from '@/components/atoms';
import ImageBlock from '@/components/molecules/ImageBlock';
import CloseIcon from '@/components/svgs/close';
import MenuIcon from '@/components/svgs/menu';
import HeaderLink from './HeaderLink';

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
    <div className="ml-auto lg:hidden">
      <button
        aria-label="Open Menu"
        className="h-10 min-h-full p-4 text-lg border-l border-white/10 focus:outline-hidden"
        onClick={() => setIsMenuOpen(true)}
      >
        <MenuIcon className="fill-current w-icon h-icon" />
      </button>

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
        className={classNames(
          'text-lg inline-flex items-center justify-center',
          inMobileMenu ? 'p-5 link-fill' : 'w-12 h-12 p-0 rounded-full hover:bg-white/10 transition'
        )}
      />
    </li>
  ));
}
