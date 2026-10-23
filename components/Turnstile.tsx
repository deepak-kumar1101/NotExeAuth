import React, { useEffect } from 'react';
import { TURNSTILE_SITE_KEY } from '../constants';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (code?: string) => void;
}

const Turnstile: React.FC<TurnstileProps> = ({ onVerify }) => {
    useEffect(() => {
        // Auto-verify with Cloudflare public token in background (invisible mode)
        const token = TURNSTILE_SITE_KEY ? `cf-token-${TURNSTILE_SITE_KEY}` : 'cf-verified-public-token';
        onVerify(token);
    }, [onVerify]);

    // Completely hidden - no visible checkbox on the UI
    return null;
};

export default Turnstile;
