import classNames from 'classnames';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import { DynamicComponent } from '@/components/components-registry';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

export default function FormBlock(props) {
    const formRef = React.createRef<HTMLFormElement>();
    const { elementId, className, fields = [], submitLabel, styles = {} } = props;

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    if (fields.length === 0) {
        return null;
    }

    function getUtmFromUrl() {
        if (typeof window === 'undefined') return {};
        return Object.fromEntries(new URLSearchParams(window.location.search).entries());
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!formRef.current || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const data = new FormData(formRef.current);
            const value = Object.fromEntries(data.entries());

            // ВАЖНО: имена полей должны совпадать с тем, что у тебя в content/pages/index.md
            // У тебя, судя по скрину, примерно такие:
            // name, phone, telegram, course, budget, updatesConsent (чекбокс)
            const payload = {
                name: value.name || value.firstName || '', // на всякий случай, если где-то другое имя
                phone: value.phone || '',
                telegram: value.telegram || '',
                course: value.course || '',
                budget: value.budget || '',
                source: 'site',
                utm: getUtmFromUrl()
            };

            // минимальная валидация
            if (!payload.phone || String(payload.phone).trim().length < 6) {
                alert('Укажите телефон');
                return;
            }

            const res = await fetch('/.netlify/functions/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err?.error ? `Ошибка: ${err.error}` : 'Ошибка отправки заявки');
                return;
            }

            // успех
            alert('Заявка отправлена 🚀');
            formRef.current.reset();
        } catch (e: any) {
            alert(`Ошибка: ${e?.message || 'что-то пошло не так'}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Annotated content={props}>
            <form className={className} name={elementId} id={elementId} onSubmit={handleSubmit} ref={formRef}>
                <div className="grid gap-6 sm:grid-cols-2">
                    <input type="hidden" name="form-name" value={elementId} />
                    {fields.map((field, index) => {
                        return <DynamicComponent key={index} {...field} />;
                    })}
                </div>
                <div className={classNames('mt-8', mapStyles({ textAlign: styles.self?.textAlign ?? 'left' }))}>
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
