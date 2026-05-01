/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserCircle, Shield, CreditCard, Bell, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';
import { logout } from '../firebase';

export default function Profile() {
  const { user, isPro } = useAuth();

  if (!user) return null;

  const sections = [
    {
      title: "Account Preferences",
      items: [
        { label: "Profile Information", icon: UserCircle, sub: "Personal details and display name" },
        { label: "Security & Privacy", icon: Shield, sub: "Authentication and data controls" },
        { label: "Billing & Subscription", icon: CreditCard, sub: isPro ? "Pro Member • Active for Life" : "Free Plan • Upgrade Available" }
      ]
    },
    {
      title: "App Settings",
      items: [
        { label: "Notifications", icon: Bell, sub: "Manage AI project alerts" },
        { label: "Workflow Settings", icon: Settings, sub: "Default export and AI parameters" }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      {/* Header */}
      <header className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="h-32 w-32 rounded-full border-2 border-tertiary/30 p-1 ring-4 ring-tertiary/10">
            <img
              src={user.photoURL || ""}
              alt={user.displayName || ""}
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          {isPro && (
            <div className="absolute -bottom-2 -right-2 bg-tertiary text-zinc-950 p-2 rounded-xl shadow-lg border-2 border-background">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">{user.displayName}</h2>
          <p className="text-on-surface-variant font-medium">{user.email}</p>
        </div>
        <div className="px-4 py-1.5 bg-tertiary/10 border border-tertiary/20 rounded-full">
          <span className="text-tertiary text-[10px] font-black uppercase tracking-widest">{isPro ? 'Life Time Pro Tier' : 'Standard Access'}</span>
        </div>
      </header>

      {/* Main List */}
      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline px-2">{section.title}</h3>
            <div className="glass-surface rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
              {section.items.map((item) => (
                <motion.button 
                  key={item.label}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  className="w-full flex items-center justify-between p-6 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 p-6 glass-surface rounded-2xl text-secondary font-black uppercase tracking-widest text-xs border border-secondary/10 hover:bg-secondary/5 transition-all shadow-xl shadow-red-950/10"
        >
          <LogOut className="w-5 h-5" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
