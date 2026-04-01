import { generateGlobalCssVariables } from '@/utils/theme-style-utils';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import '../css/main.css';

export default function MyApp({ Component, pageProps }) {
    const { global, ...page } = pageProps;
    const { theme } = global || {};
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const previousUrlRef = useRef('');

    const cssVars = generateGlobalCssVariables(theme);

    useEffect(() => {
        setIsMounted(true);
        document.body.setAttribute('data-theme', page.colors || 'colors-a');
        window.YA_METRIKA_ID = 107082371;
    }, [page.colors]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const trackPageHit = (url) => {
            if (typeof window.ym !== 'function') return;

            const currentPath = `${window.location.origin}${url}`;
            const referer = previousUrlRef.current || document.referrer;
            window.ym(107082371, 'hit', currentPath, { referer });
            previousUrlRef.current = currentPath;
        };

        previousUrlRef.current = window.location.href;
        router.events.on('routeChangeComplete', trackPageHit);

        return () => router.events.off('routeChangeComplete', trackPageHit);
    }, [router.events]);

    return (
        <>
            <Script id="yandex-metrika" strategy="afterInteractive">{`
                (function(m,e,t,r,i,k,a){
                    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                    m[i].l=1*new Date();
                    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107082371', 'ym');

                ym(107082371, 'init', {
                    ssr:true,
                    webvisor:true,
                    clickmap:true,
                    ecommerce:'dataLayer',
                    referrer: document.referrer,
                    url: location.href,
                    accurateTrackBounce:true,
                    trackLinks:true
                });
            `}</Script>
            <noscript>
                <div>
                    <img src="https://mc.yandex.ru/watch/107082371" style={{ position: 'absolute', left: '-9999px' }} alt="" />
                </div>
            </noscript>
            <style jsx global>{`
                :root {
                    ${cssVars}
                }
            `}</style>
            {isMounted ? <Component {...pageProps} /> : null}
        </>
    );
}
