import React, { useState } from 'react';
import { ModerationLog } from '../types';
import { Shield, Search, Calendar, User, FileClock, ClipboardList, Info } from 'lucide-react';

interface AuditLogsProps {
  logs: ModerationLog[];
}

export default function AuditLogs({ logs }: AuditLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.staffUsername.toLowerCase().includes(s) ||
      (log.targetUsername && log.targetUsername.toLowerCase().includes(s)) ||
      log.staffId.includes(s) ||
      (log.targetId && log.targetId.includes(s))
    );
  });

  return (
    <div className="glass rounded-xl p-5 text-slate-100 animate-fade-in" id="audit-logs-panel">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10 mb-5">
        <div className="flex items-center gap-2.5">
          <FileClock className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-display font-semibold text-sm">Journaux d'Audit & Logs de Modération</h3>
            <p className="text-[11px] text-slate-400">Historique complet des actions critiques effectuées par les membres du staff.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filtrer les journaux de logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/5 rounded-lg flex gap-3 text-indigo-200 mb-5 text-xs">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed opacity-90">
          Ce registre est **authentique et immuable**. Chaque changement de statut, assignation de grade ou révocation brutale de staff est tracé côté serveur avec l'identité de l'opérateur. Les logs d'actions sont également relayés sur le webhook Discord de la Fondation.
        </p>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-black/25 rounded-lg border border-white/5 font-mono">
            Aucun journal d'audit ne correspond à votre recherche.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isPromotion = log.action.toLowerCase().includes('promu') || log.action.toLowerCase().includes('rôle mis à jour');
            const isRevocation = log.action.toLowerCase().includes('révocation') || log.action.toLowerCase().includes('retirés');
            const isCreation = log.action.toLowerCase().includes('candidature créée') || log.action.toLowerCase().includes('soumise');

            let logTypeColor = 'border-white/5 bg-black/15';
            if (isPromotion) logTypeColor = 'border-amber-500/20 bg-amber-500/5 text-amber-200';
            if (isRevocation) logTypeColor = 'border-rose-500/20 bg-rose-500/5 text-rose-200';
            if (isCreation) logTypeColor = 'border-emerald-500/10 bg-emerald-500/5 text-emerald-200';

            return (
              <div
                key={log.id}
                className={`p-3.5 border rounded-lg transition-all text-xs ${logTypeColor}`}
                id={`audit-log-row-${log.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-150 leading-relaxed font-sans">{log.action}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                        <User className="w-3 h-3" />
                        {log.staffUsername}
                      </span>
                      <span>(ID: {log.staffId.substring(0, 8)})</span>
                      {log.targetUsername && (
                        <>
                          <span>➔</span>
                          <span className="text-slate-400">Cible: {log.targetUsername}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {new Date(log.timestamp).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">LOG_ID: {log.id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
