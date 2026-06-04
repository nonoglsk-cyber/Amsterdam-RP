import React, { useState } from 'react';
import { Application, StaffRole, Comment, ApplicationStatus } from '../types';
import { Search, Clock, BookOpen, CheckCircle2, XCircle, Tag, MessageSquare, Send, Calendar, User, Eye, Check, X } from 'lucide-react';

interface StaffApplicationsProps {
  applications: Application[];
  userRole: StaffRole;
  staffId: string;
  onStatusUpdated: () => void;
}

export default function StaffApplications({ applications, userRole, staffId, onStatusUpdated }: StaffApplicationsProps) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    applications.length > 0 ? applications[0].id : null
  );
  const [search, setSearch] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [commenting, setCommenting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Séparer les candidatures filtrées par recherche
  const isModoOnly = userRole === 'modo';
  const roleRank = { 'user': 0, 'modo': 1, 'admin': 2, 'gerant': 3, 'fondation': 4 }[userRole] || 0;

  const filteredApps = applications.filter(app => {
    // Si modo, le backend limite déjà, mais on double-vérifie côté client
    if (isModoOnly && app.status !== 'pending') return false;
    
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    
    const pseudoRobloxVal = app.pseudoRoblox || '';
    const pseudoDiscordVal = app.pseudoDiscord || '';
    const experienceStaffVal = app.experienceStaff || '';

    return (
      app.username.toLowerCase().includes(s) ||
      pseudoRobloxVal.toLowerCase().includes(s) ||
      pseudoDiscordVal.toLowerCase().includes(s) ||
      app.userId.toLowerCase().includes(s) ||
      experienceStaffVal.toLowerCase().includes(s) ||
      app.id.toLowerCase().includes(s)
    );
  });

  // Sélectionner la candidature active
  const selectedApp = applications.find(app => app.id === selectedAppId) || (filteredApps.length > 0 ? filteredApps[0] : null);

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onStatusUpdated();
      } else {
        const data = await response.json();
        alert(data.error || 'Impossible de mettre à jour le statut.');
      }
    } catch (e) {
      console.error('Erreur de statut:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !commentText.trim()) return;

    setCommenting(true);
    try {
      const response = await fetch(`/api/applications/${selectedApp.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        setCommentText('');
        onStatusUpdated(); // Recharger les données
      } else {
        const data = await response.json();
        alert(data.error || 'Impossible de publier le commentaire.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  const getStatusStyle = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400', label: 'En attente' };
      case 'reading':
        return { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400', label: 'Lecture' };
      case 'accepted':
        return { bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', label: 'Accepté' };
      case 'rejected':
        return { bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400', label: 'Refusé' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="staff-applications">
      {/* 1. Colonne Gauche - Liste et recherche */}
      <div className="lg:col-span-4 space-y-4">
        <div className="glass rounded-xl p-4">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher par pseudo ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
              id="search-candidate"
            />
          </div>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {isModoOnly ? '⏳ Candidatures en attente (Modérateur uniquement)' : `📂 Dossiers trouvés (${filteredApps.length})`}
          </div>

          {filteredApps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-550 bg-black/25 rounded-lg border border-white/5 font-mono">
              Aucune candidature trouvée.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isCurrent = selectedApp?.id === app.id;
                const badges = getStatusStyle(app.status);
                return (
                  <button
                    key={app.id}
                    onClick={() => { setSelectedAppId(app.id); }}
                    className={`w-full text-left p-3 rounded-lg border transition duration-200 text-xs flex gap-3 ${
                      isCurrent
                        ? 'bg-white/15 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                        : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/15 hover:shadow-sm'
                    }`}
                    id={`btn-select-app-${app.id}`}
                  >
                    <img
                      src={app.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'}
                      alt={app.username}
                      className="w-9 h-9 rounded-full border border-slate-700 shrink-0 select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="grow min-w-0">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="font-bold text-slate-200 truncate">{app.username}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border uppercase tracking-wider ${badges.bg}`}>
                          {badges.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{app.age} ans • #{app.id}</div>
                      <div className="text-[9px] text-slate-400 truncate mt-1">
                        Candidature du : {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Colonne Droite - Visionneuse de détail */}
      <div className="lg:col-span-8">
        {selectedApp ? (
          <div className="glass rounded-xl p-5 space-y-5" id="applications-viewer">
            {/* Header Profil */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedApp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'}
                  alt={selectedApp.username}
                  className="w-12 h-12 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-100">{selectedApp.username}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                    <span>ID Discord: {selectedApp.userId}</span>
                    <span>•</span>
                    <span>#{selectedApp.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Date du dépôt</span>
                  <span className="text-xs text-slate-300 font-medium">{new Date(selectedApp.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={`text-[10px] uppercase font-bold px-3 py-1.5 border rounded-lg ${getStatusStyle(selectedApp.status).bg}`}>
                  Statut: {getStatusStyle(selectedApp.status).label}
                </div>
              </div>
            </div>

            {/* Contenu Formulaire */}
            <div className="grid grid-cols-1 gap-5">
              {/* Identity and timezone cards inside a tight elegant grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl font-sans">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">1. Pseudo Roblox</span>
                  <p className="text-sm font-semibold text-slate-200">{selectedApp.pseudoRoblox || selectedApp.username || 'Non spécifié'}</p>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl font-sans">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">2. Pseudo Discord</span>
                  <p className="text-sm font-semibold text-slate-200">{selectedApp.pseudoDiscord || `@${selectedApp.username}`}</p>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl font-sans">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">3. Âge</span>
                  <p className="text-sm font-semibold text-slate-200">{selectedApp.age} ans</p>
                </div>
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl font-sans">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">4. Fuseau Horaire</span>
                  <p className="text-sm font-semibold text-slate-200">{selectedApp.fuseauHoraire || 'Paris (UTC+1)'}</p>
                </div>
              </div>

              {/* Disponibilités jours taglist card */}
              <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl font-sans">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">5. Disponibilités (jours)</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedApp.disponibilites) && selectedApp.disponibilites.length > 0 ? (
                    selectedApp.disponibilites.map((day: string) => (
                      <span key={day} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-lg font-medium">
                        {day}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Aucun jour sélectionné ou spécifié</span>
                  )}
                </div>
              </div>

              {/* Rest of the Google Form responses as comprehensive QA sections */}
              <div className="space-y-4 font-sans">
                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    6. Avez-vous déjà occupé un poste de modération sur EH ? Expérience :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.experienceStaff || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    7. Connaissez-vous des commandes (en citer 4) :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.connaissanceCommandes || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    10. Que signifie HRP pour vous :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.significationHrp || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    8. Pourquoi souhaitez-vous rejoindre l'équipe staff d'Amsterdam RP ? :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.pourquoiRejoindre || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-[#1e293b]/30 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    9. Un joueur encombrant perturbe les autres / non-respect RP :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.comportementPerturbateur || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-[#1e293b]/30 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1.5 leading-relaxed">
                    11. Signalement de comportement inapproprié en DM privé Discord :
                  </span>
                  <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.comportementInapproprieMpj || 'Non renseigné'}
                  </p>
                </div>

                <div className="p-4 bg-slate-900/45 border border-white/5 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                    12. Lu et compris les règles du serveur et du jeu ?
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-lg font-bold uppercase tracking-wider font-mono">
                    {selectedApp.luReglement === true ? '✓ Oui' : '× Non / Non spécifié'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Administratives (Accepté / Refusé / Lecture) */}
            {roleRank >= 2 ? (
              <div className="p-4 bg-black/30 border border-white/5 rounded-lg space-y-3" id="admin-action-controls">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Décision Administrative Staff</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    disabled={updatingId !== null || selectedApp.status === 'reading'}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'reading')}
                    className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-blue-550/15 text-blue-400 font-medium hover:border-blue-500/20 border border-transparent rounded-lg text-xs cursor-pointer disabled:opacity-50 transition"
                    id="btn-mark-reading"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>📖 Examiner</span>
                  </button>

                  <button
                    disabled={updatingId !== null || selectedApp.status === 'accepted'}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs cursor-pointer disabled:opacity-50 transition"
                    id="btn-mark-accepted"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accepter</span>
                  </button>

                  <button
                    disabled={updatingId !== null || selectedApp.status === 'rejected'}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white font-medium rounded-lg text-xs cursor-pointer disabled:opacity-50 transition"
                    id="btn-mark-rejected"
                  >
                    <X className="w-4 h-4" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-black/20 border border-white/5 rounded-lg text-[11px] text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Rôle Modérateur actif. Seul un administrateur supérieure peut modifier le statut de traitement d'un dossier.</span>
              </div>
            )}

            {/* Panel de Commentaires Internes (Gérants et fondations uniquement) */}
            {roleRank >= 3 ? (
              <div className="space-y-4 border-t border-white/10 pt-4" id="staff-comments-section">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Notes & Commentaires Internes (Réservé Gérant+)</span>
                </h4>

                <div className="space-y-2.5 max-h-40 overflow-y-auto">
                  {selectedApp.comments.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500 font-mono">
                      Aucun commentaire interne déposé pour le moment.
                    </div>
                  ) : (
                    selectedApp.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-black/20 border border-white/5 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-indigo-300">{comm.staffUsername}</span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(comm.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Écrire une note interne pour le dossier de recrutement..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="grow bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={commenting || !commentText.trim()}
                    className="p-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
                    id="btn-add-comment"
                  >
                    {commenting ? '...' : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3 bg-black/20 border border-white/5 rounded-lg text-[11px] text-slate-500 select-none cursor-not-allowed">
                 🔒 Seuls les grades de **Gérant Staff** ou **Fondation** ont l'autorisation de voir et d'éditer les notes internes confidentielles sur les candidats de l'île.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center py-20 glass rounded-xl" id="no-candidate-selected">
            <div className="text-center">
              <User className="w-12 h-12 text-slate-650 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Sélectionnez une candidature dans la colonne de gauche pour l'analyser.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
