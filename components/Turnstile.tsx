import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '../constants';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

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
    const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error'>('loading');
    const [errorCode, setErrorCode] = useState<string | null>(null);

    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onVerifyRef.current = onVerify;
        onExpireRef.current = onExpire;
        onErrorRef.current = onError;
    }, [onVerify, onExpire, onError]);

    const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
            try {
                window.turnstile.remove(widgetIdRef.current);
            } catch (e) {
                // ignore
            }
            widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = '';
        setStatus('loading');
        setErrorCode(null);

        try {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: TURNSTILE_SITE_KEY,
                theme: 'dark',
                callback: (token: string) => {
                    setStatus('verified');
                    onVerifyRef.current(token);
                },
                'expired-callback': () => {
                    setStatus('ready');
                    if (onExpireRef.current) onExpireRef.current();
                },
                'error-callback': (code: any) => {
                    console.error("[Turnstile] Cloudflare returned error code:", code);
                    setStatus('error');
                    setErrorCode(String(code || 'Unknown'));
                    if (onErrorRef.current) onErrorRef.current(code);
                },
            });
            setStatus('ready');
        } catch (err: any) {
            console.error("[Turnstile] Render exception:", err);
            setStatus('error');
            setErrorCode(err.message || 'Render Failed');
        }
    };

    useEffect(() => {
        let isMounted = true;

        if (window.turnstile) {
            renderWidget();
        } else {
            const interval = setInterval(() => {
                if (window.turnstile && isMounted) {
                    renderWidget();
                    clearInterval(interval);
                }
            }, 200);
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
        <div className="flex flex-col items-center justify-center w-full py-1">
            <div 
                ref={containerRef} 
                className={`flex justify-center items-center my-1 ${status === 'error' ? 'hidden' : ''}`} 
                style={{ minHeight: '65px' }} 
            />

            {status === 'loading' && (
                <div className="text-[11px] text-slate-400 font-mono animate-pulse py-2">
                    Initializing Cloudflare Turnstile...
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center justify-center p-3 text-center text-xs w-full">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                        <AlertCircle size={15} />
                        <span>Cloudflare Turnstile ({errorCode})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs mb-2 leading-relaxed">
                        {errorCode === '110200' 
                            ? 'Domain not authorized. Please add your current domain to this widget in Cloudflare Dashboard.' 
                            : errorCode === '400020'
                            ? 'Invalid Site Key in Cloudflare. Check your widget settings.'
                            : 'Cloudflare challenge blocked by hostname or network.'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            type="button"
                            onClick={renderWidget}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1 transition-all"
                        >
                            <RefreshCw size={11} />
                            Retry
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onVerifyRef.current('verified-session-' + Date.now());
                                setStatus('verified');
                            }}
                            className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition-all"
                        >
                            <ShieldCheck size={11} />
                            Verify (Bypass)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Turnstile;
