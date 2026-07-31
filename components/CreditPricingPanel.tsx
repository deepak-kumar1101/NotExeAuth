import React, { useState } from 'react';
import { ref, set, remove } from 'firebase/database';
import { encrypt } from '../services/encryption';
import { addToast } from '../services/toastService';
import { db } from '../services/firebase';
import { CreditPackage } from '../types';
import { DEFAULT_CREDIT_PACKAGES } from '../constants';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface CreditPricingPanelProps {
  creditPackages: Record<string, CreditPackage>;
  setCreditPackages: React.Dispatch<React.SetStateAction<Record<string, CreditPackage>>>;
}

const CreditPricingPanel: React.FC<CreditPricingPanelProps> = ({ creditPackages, setCreditPackages }) => {
  const resetToDefaults = async () => {
    DEFAULT_CREDIT_PACKAGES.forEach(async (pkg) => {
      await set(ref(db, `system/creditPackages/${pkg.id}`), encrypt(pkg));
    });
    addToast('Restored all pre‑made credit packages to defaults');
  };

  const addCustomPackage = async () => {
    const newId = `pkg_${Date.now()}`;
    const newPkg: CreditPackage = {
      id: newId,
      name: 'Custom Credit Package',
      credits: 100,
      priceINR: 999,
      popular: false,
      recommendedFor: 'Custom Tier',
      badge: 'Standard',
      order: Object.keys(creditPackages).length + 1,
    };
    await set(ref(db, `system/creditPackages/${newId}`), encrypt(newPkg));
    addToast('Created new credit package');
  };

  const deletePackage = async (pkgId: string, pkgName: string) => {
    await remove(ref(db, `system/creditPackages/${pkgId}`));
    addToast(`Deleted package ${pkgName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Credit Packages &amp; INR Pricing Catalog</h2>
          <p className="text-xs text-slate-400">
            Configure prices (₹ INR), credit amounts (PTS), badges, and recommendations for all pre‑made and custom credit cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-amber-400" /> Reset to Defaults
          </button>
          <button
            onClick={addCustomPackage}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={15} /> Add Custom Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(
          Object.keys(creditPackages).length > 0
            ? creditPackages
            : DEFAULT_CREDIT_PACKAGES.reduce((acc, p) => ({ ...acc, [p.id]: p as CreditPackage }), {} as Record<string, CreditPackage>)
        )
          .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
          .map(([pkgId, pkg]) => (
            <div
              key={pkgId}
              className={`glass-card p-6 rounded-3xl border transition-all space-y-4 relative ${
                pkg.popular
                  ? 'bg-gradient-to-b from-indigo-500/10 via-white/[0.03] to-white/[0.02] border-indigo-500/50 shadow-xl'
                  : 'bg-white/[0.03] border-white/10'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                  Popular Choice
                </div>
              )}
              <div className="flex justify-between items-start pt-1">
                <div className="flex-1 mr-2">
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={e => {
                      const updated = { ...pkg, name: e.target.value };
                      set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                    }}
                    className="bg-transparent font-bold text-white text-base focus:outline-none focus:border-b border-indigo-500 w-full"
                    placeholder="Package Name"
                  />
                  <input
                    type="text"
                    value={pkg.badge || ''}
                    onChange={e => {
                      const updated = { ...pkg, badge: e.target.value };
                      set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                    }}
                    placeholder="Badge Tag (e.g. Save 20%)"
                    className="bg-transparent text-[10px] text-indigo-400 uppercase font-mono tracking-wider focus:outline-none mt-1 w-full"
                  />
                </div>
                <button
                  onClick={() => deletePackage(pkgId, pkg.name)}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Delete Package"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Credits (PTS)</label>
                  <input
                    type="number"
                    value={pkg.credits}
                    onChange={e => {
                      const updated = { ...pkg, credits: parseInt(e.target.value) || 0 };
                      set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                    }}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={pkg.priceINR}
                    onChange={e => {
                      const updated = { ...pkg, priceINR: parseInt(e.target.value) || 0 };
                      set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                    }}
                    className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recommended For</label>
                <input
                  type="text"
                  value={pkg.recommendedFor || ''}
                  onChange={e => {
                    const updated = { ...pkg, recommendedFor: e.target.value };
                    set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                  }}
                  placeholder="e.g. Pro Plan (Monthly)"
                  className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">Popular Badge Tag</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...pkg, popular: !pkg.popular };
                    set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    pkg.popular ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {pkg.popular ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        {Object.keys(creditPackages).length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
            No credit packages available. Click "Reset to Defaults" above to seed all pre‑made cards.
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditPricingPanel;
