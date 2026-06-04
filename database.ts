import React, { useState, useEffect } from 'react';
import { User, ModerationLog } from '../types';
import { Radio, Users, Cpu, MessageSquare, Send, Bell, Award, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface LiveMessage {
  id: string;
  username: string;
  avatar: string | null;
  message: string;
  role: string;
  timestamp: string;
}

interface LiveHubProps {
  currentUser: User;
  liveMessages: LiveMessage[];
  onSendMessage: (msg: string) => Promise<boolean>;
  recentEvents: Array<{ id: string; text: string; time: string; type: string }>;
}

export default function LiveHub({ currentUser, liveMessages, onSendMessage, recentEvents }: LiveHubProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [discordOnline, setDiscordOnline] = useState(247);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiscordOnline(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        return Math.max(210, Math.min(290, prev + change));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || loading) return;
    setLoading(true);
    const success = await onSendMessage(typedMessage);
    if (success) {
      setTypedMessage('');
    }
    setLoading(false);
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'fondation': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'gerant': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'admin': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'modo': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-slate-330 bg-slate-500/10 border-white/5';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'fondation': return 'FONDATION';
      case 'gerant': return 'GÉRANT';
      case 'admin': return 'ADMIN';
      case 'modo': return 'MODO';
      default: return 'CANDIDAT';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-100" id="live-hub-root">
      {/* Colonne Gauche : Statut du Serveur */}
      <div className="lg:col-span-4 space-y-5">
        <div className="glass rounded-xl p-5 relative overflow-hidden" id="card-server-status">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 blur-xl rounded-full"></div>
          
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wide">Amsterdam State Sync</h3>
              <p className="text-[10px] text-slate-400">Statistiques du serveur de jeu synchro</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Statut IP */}
            <div className="flex items-center justify-between text-xs p-2.5 bg-black/15 border border-white/5 rounded-lg">
              <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                <span>Statut général</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/20 rounded">EN LIGNE</span>
            </div>

            {/* Discord online member count */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between text-xs text-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <Users className="relative w-3.5 h-3.5 text-indigo-400" />
                  </span>
                  <span>Membres en ligne (Discord)</span>
                </span>
                <span className="font-mono font-bold text-indigo-300">{discordOnline} <span className="text-slate-500 font-normal">/ 350</span></span>
              </div>
              <div className="w-full h-2 bg-black/35 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${(discordOnline / 350) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-black/15 border border-white/5 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Latence Sync</div>
                <div className="text-sm font-black text-indigo-400 font-mono mt-0.5">24 ms</div>
              </div>
              <div className="p-3 bg-black/15 border border-white/5 rounded-lg text-center">
                <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Taux de Tick</div>
                <div className="text-sm font-black text-pink-400 font-mono mt-0.5">128 Hz</div>
              </div>
            </div>

            {/* Services Matrix */}
            <div className="text-[11px] space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">Service REST API</span>
                <span className="text-emerald-400 font-bold">Opérationnel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">EventStream Link</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Connecté</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-mono">Discord Webhook</span>
                <span className="text-emerald-450 font-bold">Actif (Sandbox)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2" id="live-ad-box">
          <Sparkles className="w-5 h-5 text-indigo-400 mx-auto" />
          <h4 className="font-display font-semibold text-xs tracking-wide">Écriture Directe Synchronisée</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Faites le test ! Ouvrez cette page dans **deux onglets différents** du navigateur. Écrivez un message ou mettez à jour une candidature, tout s'actualise instantanément !
          </p>
        </div>
      </div>

      {/* Colonne Milieu : Chat Interactif du Staff & Candidats */}
      <div className="lg:col-span-4 flex flex-col glass rounded-xl overflow-hidden h-[420px]" id="live-chat-panel">
        <div className="p-4 border-b border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-pink-400" />
            <h3 className="font-display font-medium text-xs uppercase tracking-wider">Salon de Discussion Interactif</h3>
          </div>
          <span className="text-[9px] bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono font-bold px-1.5 py-0.5 rounded leading-none">REAL-TIME</span>
        </div>

        {/* Message area */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scroll-smooth" id="live-messages-container">
          {liveMessages.map((msg) => (
            <div key={msg.id} className="flex gap-2.5 items-start animate-fade-in text-xs">
              <img
                src={msg.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'}
                alt={msg.username}
                className="w-7 h-7 rounded-md border border-white/10 shrink-0 pointer-events-none"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-semibold text-[11px] text-slate-100">{msg.username}</span>
                  <span className={`text-[8px] font-bold px-1 border leading-none py-0.5 rounded ${getRoleStyle(msg.role)}`}>
                    {getRoleLabel(msg.role)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono ml-auto">{msg.timestamp}</span>
                </div>
                <p className="text-slate-300 select-all leading-tight mt-1 p-2.5 bg-black/15 border border-white/5 rounded-lg break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-2.5 border-t border-white/10 bg-black/15 flex gap-2">
          <input
            type="text"
            placeholder="Écrivez un message en direct..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-1 bg-black/35 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition"
            maxLength={100}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="p-2 bg-pink-600 hover:bg-pink-700 active:scale-95 text-white rounded-lg transition shrink-0 cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Colonne Droite : Flux d'Activité Immédiat */}
      <div className="lg:col-span-4 flex flex-col glass rounded-xl overflow-hidden h-[420px]" id="live-activity-stream">
        <div className="p-4 border-b border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-yellow-500" />
            <h3 className="font-display font-medium text-xs uppercase tracking-wider">Activité du Serveur en Direct</h3>
          </div>
          <span className="inline-flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2.5" id="live-events-container">
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500">
              <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs font-mono">Aucun événement n'a encore transité sur le EventStream.</p>
            </div>
          ) : (
            recentEvents.map((ev) => {
              const isPromotion = ev.type?.includes('promoted');
              const isStatus = ev.type?.includes('status');
              const isCreation = ev.type?.includes('created');

              let pillColor = 'border-white/5 bg-black/10 text-slate-350';
              if (isPromotion) pillColor = 'border-amber-500/20 bg-amber-500/5 text-amber-300';
              if (isStatus) {
                if (ev.text.includes('Acceptée') || ev.text.includes('accepted')) pillColor = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300';
                else if (ev.text.includes('Refusée') || ev.text.includes('rejected')) pillColor = 'border-rose-500/20 bg-rose-500/5 text-rose-300';
                else pillColor = 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300';
              }
              if (isCreation) pillColor = 'border-pink-500/20 bg-pink-500/5 text-pink-300';

              return (
                <div
                  key={ev.id}
                  className={`p-2.5 border rounded-lg flex gap-2 items-start transition duration-200 text-xs animate-fade-in ${pillColor}`}
                >
                  <div className="grow leading-tight select-none">
                    {ev.text}
                  </div>
                  <div className="text-[9px] font-mono opacity-60 self-center shrink-0">
                    {ev.time}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
