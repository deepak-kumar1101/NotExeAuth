import React, { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../constants';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (code?: string) => void;
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
            if (window.turnstile && containerRef.current && isMounted) {
                if (widgetIdRef.current) {
                    try {
                        window.turnstile.remove(widgetIdRef.current);
                    } catch (e) {
                        // ignore
                    }
                    widgetIdRef.current = null;
                }

                try {
                    widgetIdRef.current = window.turnstile.render(containerRef.current, {
                        sitekey: TURNSTILE_SITE_KEY,
                        theme: 'dark',
                        callback: (token: string) => {
                            if (isMounted) onVerifyRef.current(token);
                        },
                        'expired-callback': () => {
                            if (isMounted && onExpireRef.current) onExpireRef.current();
                        },
                        'error-callback': (errCode: any) => {
                            console.error("[Turnstile] Cloudflare returned error code:", errCode);
                            if (isMounted && onErrorRef.current) onErrorRef.current(errCode);
                        },
                    });
                } catch (err) {
                    console.error("[Turnstile] Render exception:", err);
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
            }, 300);
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
                    // ignore
                }
                widgetIdRef.current = null;
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            <div ref={containerRef} className="flex justify-center my-2" style={{ minHeight: '65px' }} />
        </div>
    );
};

export default Turnstile;
