
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, set, get } from 'firebase/database';
import { Crown, Coins, MessageSquare, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import { Customer, SystemPlan } from '../types';

const DEFAULT_PLANS: Record<string, SystemPlan> = {
  'Free Plan': {
    maxApps: 2,
    maxUsers: 50,
    onSale: true,
    creditPrice: 0,
    price: '$0',
    order: 1,
    features: ['multi_app', 'user_data']
  },
  'Starter Plan': {
    maxApps: 5,
    maxUsers: 250,
    onSale: true,
    creditPrice: 50,
    price: '50 Credits',
    order: 2,
    features: ['multi_app', 'user_data', 'webhooks']
  },
  'Pro Plan': {
    maxApps: 15,
    maxUsers: 1000,
    onSale: true,
    creditPrice: 150,
    price: '150 Credits',
    order: 3,
    features: ['multi_app', 'user_data', 'webhooks', 'cloud_vars']
  },
  'Enterprise Plan': {
    maxApps: -1,
    maxUsers: -1,
    onSale: true,
    creditPrice: 300,
    price: '300 Credits',
    order: 4,
    features: ['multi_app', 'user_data', 'webhooks', 'cloud_vars', 'reseller']
  }
};

const Shop: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [plans, setPlans] = useState<Record<string, SystemPlan>>({});
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser?.email) return;
    const emailKey = auth.currentUser.email.replace(/\./g, ',');

    onValue(ref(db, `customers/${emailKey}`), (snap) => {
      setCustomer(decrypt(snap.val()));
    });

    onValue(ref(db, `system/plans`), async (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, SystemPlan> = {};
      Object.keys(raw).forEach(k => {
        const p = decrypt(raw[k]);
        if (p && p.onSale) dec[k] = p;
      });

      if (Object.keys(dec).length === 0) {
        setPlans(DEFAULT_PLANS);
        // Seed default plans into Firebase
        const seedPayload: Record<string, any> = {};
        Object.keys(DEFAULT_PLANS).forEach(pName => {
          seedPayload[pName] = encrypt(DEFAULT_PLANS[pName]);
        });
        try {
          await set(ref(db, `system/plans`), seedPayload);
        } catch (e) {
          console.warn("Auto plan seed error:", e);
        }
      } else {
        setPlans(dec);
      }
    });
  }, []);

  const buyPlan = async (name: string, plan: SystemPlan) => {
    if (!customer || !auth.currentUser?.email) return;
    if (customer.credits < plan.creditPrice) {
      alert(`Insufficient credits. You need ${plan.creditPrice} but have ${customer.credits}.`);
      return;
    }

    if (!confirm(`Confirm purchase of ${name} for ${plan.creditPrice} credits?`)) return;

    setBuying(name);
    try {
      const emailKey = auth.currentUser.email.replace(/\./g, ',');
      const updatedCustomer = {
        ...customer,
        credits: customer.credits - plan.creditPrice,
        plan: name
      };
      await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
      alert('Plan upgraded successfully!');
    } catch (err) {
      alert('Purchase failed.');
    }
    setBuying(null);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none grid-bg opacity-30" />
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-5xl glass-card rounded-full border border-white/[0.08] px-6 py-3 flex justify-between items-center shadow-xl backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white text-black font-black flex items-center justify-center text-xs">DXA</div>
            <span className="font-bold text-xs uppercase tracking-widest text-white">Shop</span>
          </Link>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{customer?.credits || 0} Credits</span>
            </div>
            <Link to="/dashboard" className="text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto animate-fade-in relative z-10">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
            Infrastructure Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">Upgrade Your Infrastructure.</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Use your credits to unlock premium application limits and features.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(plans) as [string, SystemPlan][])
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([name, plan]) => (
              <div key={name} className="glass-card glass-card-hover p-8 rounded-3xl border border-white/10 flex flex-col group relative overflow-hidden shadow-2xl">
                {customer?.plan === name && (
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">Active Plan</div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
                  <div className="text-3xl font-black flex items-baseline gap-1 text-white">
                    {plan.creditPrice} <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Credits</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-slate-300 flex-grow">
                  <li className="flex items-center gap-2 font-semibold"><Check size={14} className="text-indigo-400 shrink-0" /> Max Apps: {plan.maxApps === -1 ? 'Unlimited' : plan.maxApps}</li>
                  <li className="flex items-center gap-2 font-semibold"><Check size={14} className="text-indigo-400 shrink-0" /> Max Users: {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</li>
                  {plan.features?.map(feature => (
                    <li key={feature} className="flex items-center gap-2 font-semibold">
                      <Check size={14} className="text-indigo-400 shrink-0" />
                      {feature === 'webhooks' && 'Webhooks Support'}
                      {feature === 'multi_app' && 'Multiple Applications'}
                      {feature === 'reseller' && 'Reseller Portal Access'}
                      {feature === 'cloud_vars' && 'Cloud Variables'}
                      {feature === 'user_data' && 'User Data Export'}
                      {!['webhooks', 'multi_app', 'reseller', 'cloud_vars', 'user_data'].includes(feature) && feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => buyPlan(name, plan)}
                  disabled={customer?.plan === name || buying === name}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${customer?.plan === name ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' : 'btn-saas-primary'}`}
                >
                  {buying === name ? <Loader2 className="animate-spin mx-auto" size={16} /> : customer?.plan === name ? 'Current Plan' : 'Purchase with Credits'}
                </button>
              </div>
            ))}
          {Object.keys(plans).length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No plans currently on sale.</div>
          )}
        </div>

        <div className="mt-16 glass-card p-8 rounded-3xl border border-white/10 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
          <h2 className="text-xl font-extrabold text-white mb-2 relative z-10">Earn Free Bonus Credits!</h2>
          <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed relative z-10">Join our official Discord community to earn free credits through daily events and rewards.</p>
          <a href="https://discord.gg/HrVXH3wNpj" target="_blank" rel="noreferrer" className="btn-saas-primary inline-flex items-center gap-2 px-7 py-3 text-xs uppercase font-bold tracking-wider relative z-10 shadow-lg">
            <MessageSquare size={15} /> Join Discord & Claim Credits
          </a>
        </div>
      </main>
    </div>
  );
};

export default Shop;
