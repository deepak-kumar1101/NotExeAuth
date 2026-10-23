import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '../constants';

const FALLBACK_TEST_KEY = '1x00000000000000000000AA';

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
    const [currentKey, setCurrentKey] = useState<string>(TURNSTILE_SITE_KEY || FALLBACK_TEST_KEY);
    const hasFallenBackRef = useRef(false);

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
                        sitekey: currentKey,
                        theme: 'dark',
                        callback: (token: string) => {
                            if (isMounted) onVerifyRef.current(token);
                        },
                        'expired-callback': () => {
                            if (isMounted && onExpireRef.current) onExpireRef.current();
                        },
                        'error-callback': (errCode: any) => {
                            console.warn("Turnstile widget error code:", errCode);
                            if (isMounted && onErrorRef.current) onErrorRef.current(errCode);

                            // If invalid sitekey (400020) or domain disallowed (110200), auto-fallback to universal test key
                            if (!hasFallenBackRef.current && currentKey !== FALLBACK_TEST_KEY) {
                                console.info("Turnstile: Falling back to universal testing key...");
                                hasFallenBackRef.current = true;
                                setCurrentKey(FALLBACK_TEST_KEY);
                            }
                        },
                    });
                } catch (err) {
                    console.error("Turnstile render error:", err);
                    if (!hasFallenBackRef.current && currentKey !== FALLBACK_TEST_KEY) {
                        hasFallenBackRef.current = true;
                        setCurrentKey(FALLBACK_TEST_KEY);
                    }
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
    }, [currentKey]);

    return (
        <div className="flex flex-col items-center justify-center">
            <div ref={containerRef} className="flex justify-center my-2" style={{ minHeight: '65px' }} />
        </div>
    );
};

export default Turnstile;
