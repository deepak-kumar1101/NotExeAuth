import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../constants';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
}

declare global {
    interface Window {
        turnstile: any;
    }
}

const Turnstile: React.FC<TurnstileProps> = ({ onVerify, onExpire, onError }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onVerifyRef.current = onVerify;
        onExpireRef.current = onExpire;
        onErrorRef.current = onError;
    }, [onVerify, onExpire, onError]);

    useEffect(() => {
        let isMounted = true;

        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current && isMounted) {
                try {
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: TURNSTILE_SITE_KEY,
                        theme: 'dark',
                        callback: (token: string) => onVerifyRef.current(token),
                        'expired-callback': () => {
                            if (onExpireRef.current) onExpireRef.current();
                        },
                        'error-callback': () => {
                            if (onErrorRef.current) onErrorRef.current();
                        },
                    });
                } catch (err) {
                    console.error("Turnstile render error:", err);
                }
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            const interval = setInterval(() => {
                if (window.turnstile) {
                    renderWidget();
                    clearInterval(interval);
                }
            }, 500);
            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        }

        return () => {
            isMounted = false;
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    console.error("Turnstile remove error:", e);
                }
                widgetIdRef.current = null;
            }
        };
    }, []);

    return <div ref={containerRef} className="flex justify-center my-4" style={{ minHeight: '65px' }} />;
};

export default Turnstile;
