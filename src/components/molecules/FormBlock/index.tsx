import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

export default function FormBlock(props) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const { elementId, className, fields = [], submitLabel, styles = {} } = props;

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    if (!fields.length) return null;

    function getUtmFromUrl() {
        if (typeof window === 'undefined') return {};
        return Object.fromEntries(new URLSearchParams(window.location.search).entries());
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!formRef.current || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const data = new FormData(formRef.current);
            const value = Object.fromEntries(data.entries());

            const payload = {
                name: value.name || '',
                phone: value.phone || '',
                telegram: value.telegram || '',
                course: value.course || '',
                budget: value.budget || '',
                source: 'site',
                utm: getUtmFromUrl()
            };

            if (!payload.phone || String(payload.phone).trim().length < 6) {
                alert('Укажите корректный телефон');
                return;
            }

            const res = await fetch('/.netlify/functions/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Ошибка отправки');
            }

            alert('Заявка отправлена 🚀');
            formRef.current.reset();
        } catch (e: any) {
            alert(e.message || 'Что-то пошло не так');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Annotated content={props}>
            <form
                ref={formRef}
                id={elementId}
                className={className}
                onSubmit={handleSubmit}
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    {fields.map((field, index) => (
                        <DynamicComponent key={index} {...field} />
                    ))}
                </div>

                <div
                    className={classNames(
                        'mt-8',
                        mapStyles({ textAlign: styles.self?.textAlign ?? 'left' })
                    )}
                >
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={classNames(
                            'inline-flex items-center justify-center px-5 py-4 text-lg transition border-2 border-current hover:bottom-shadow-6 hover:-translate-y-1.5',
                            isSubmitting && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        {isSubmitting ? 'Отправляем…' : submitLabel}
                    </button>
                </div>
            </form>
        </Annotated>
    );
}
