type EventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    ym?: (counterId: number, action: 'reachGoal', target: string, params?: EventPayload) => void;
    YA_METRIKA_ID?: number;
    gtag?: (command: 'event', eventName: string, params?: EventPayload) => void;
  }
}

export function trackConversionEvent(eventName: string, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return;

  window.dataLayer?.push({ event: eventName, ...payload });
  window.gtag?.('event', eventName, payload);

  if (typeof window.ym === 'function' && typeof window.YA_METRIKA_ID === 'number') {
    window.ym(window.YA_METRIKA_ID, 'reachGoal', eventName, payload);
  }
}

