import React from 'react';
import { SignatureVerificationResult } from '../../types/sandbox';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface SignatureStatusProps {
  verification?: SignatureVerificationResult;
}

export const SignatureStatus: React.FC<SignatureStatusProps> = React.memo(({ verification }) => {
  if (!verification || !verification.hasSignature) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 font-mono">
        <ShieldAlert size={14} className="text-slate-500" />
        <span>No RSA Signature</span>
      </div>
    );
  }

  if (verification.verified) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={15} className="text-emerald-400 animate-pulse" />
        <span>✓ Signature Verified</span>
        <span className="text-[10px] text-emerald-400/70 border-l border-emerald-500/30 pl-2">
          {verification.durationMs}ms
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono shadow-[0_0_15px_rgba(244,63,94,0.2)]">
      <XCircle size={15} className="text-rose-400 animate-pulse" />
      <span>✗ Invalid Signature</span>
      <span className="text-[10px] text-rose-400/70 border-l border-rose-500/30 pl-2">
        {verification.durationMs}ms
      </span>
    </div>
  );
});

SignatureStatus.displayName = 'SignatureStatus';
