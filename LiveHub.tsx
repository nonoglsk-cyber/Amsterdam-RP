import React, { useState } from 'react';
import { User, StaffRole } from '../types';
import { ShieldAlert, UserX, UserCheck, Crown, ShieldCheck, Mail, Calendar, Trash2 } from 'lucide-react';

interface StaffManagementProps {
  users: User[];
  onStaffUpdated: () => void;
  currentUserId: string;
}

export default function StaffManagement({ users, onStaffUpdated, currentUserId }: StaffManagementProps) {
  const [targetId, setTargetId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<StaffRole>('modo');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const staffMembers = users.filter(u => u.role !== 'user');
  const normalUsers = users.filter(u => u.role === 'user');

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!targetId.trim()) {
      setError('ID Discord requis pour effectuer l\'assignation.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/staff/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, role: selectedRole }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(`Rôle ${selectedRole.toUpperCase()} assigné avec succès à l'utilisateur.`);
        setTargetId('');
        onStaffUpdated();
      } else {
        setError(data.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err) {
      setError('Erreur de communication serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (userId === currentUserId) {
      alert('Vous ne pouvez pas révoquer votre propre rôle de Fondation !');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir retirer immédiatement cette personne du staff ? Ses accès aux panels d\'administration seront instantly révoqués.')) {
      return;
    }

    try {
      const response = await fetch('/api/staff/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        onStaffUpdated();
      } else {
        const data = await response.json();
        alert(data.error || 'Une erreur est survole lors du retrait.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'fondation':
        return <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider bg-amber-500/15 border border-amber-500/20 text-amber-400 uppercase rounded">Fondation / Owner</span>;
      case 'gerant':
        return <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 uppercase rounded">Gérant Staff</span>;
      case 'admin':
        return <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider bg-rose-500/15 border border-rose-500/20 text-rose-400 uppercase rounded">Administrateur</span>;
      case 'modo':
        return <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 uppercase rounded">Modérateur</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider bg-slate-500/15 border border-slate-500/20 text-slate-400 uppercase rounded">Joueur</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-slate-100" id="staff-management">
      {/* Colonne de gauche - Formulaire d'assignation manuel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="glass rounded-xl p-5" id="staff-assignment-card">
          <div className="border-b border-white/10 pb-3 mb-4">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Module de Gestion de Permissions</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Assigner manuellement un grade à n'importe quel ID d'utilisateur Discord.</p>
          </div>

          <form onSubmit={handlePromote} className="space-y-4" id="form-staff-promotion">
            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-lg text-xs leading-relaxed" id="promote-error">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs leading-relaxed" id="promote-success">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="field-discord-id">
                Identifiant Discord de l'utilisateur <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                id="field-discord-id"
                placeholder="Ex: 555555555555555555"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                required
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">Renseignez l'ID numérique composé de 17 ou 18 chiffres.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="field-role-select">
                Sélection du rôle hiérarchique <span className="text-indigo-400">*</span>
              </label>
              <select
                id="field-role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="modo">🛡️ Modérateur (Restreint aux pending)</option>
                <option value="admin">👮 Administrateur (Traitement complet)</option>
                <option value="gerant">👔 Gérant Staff (Commentaires + Stats)</option>
                <option value="fondation">👑 Fondation / Owner (Totalité d'accès)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs tracking-wider uppercase rounded-lg transition disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-600/10"
              id="btn-assign-grade"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'Assignation...' : 'Assigner le rôle Staff'}</span>
            </button>
          </form>
        </div>

        {/* Note de mise en garde */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3 text-rose-350">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <h4 className="font-bold mb-1">Avis d'Impartialité Administrative</h4>
            <p className="opacity-90 leading-relaxed">
              La promotion administrative élève directement les permissions d'un joueur en base de données de jeu. Toute révocation ultérieure démet instantanément l'utilisateur et génère un rapport traçable dans le salon webhook.
            </p>
          </div>
        </div>
      </div>

      {/* Colonne de droite - Liste hiérarchique du Staff Actuel */}
      <div className="lg:col-span-7">
        <div className="glass rounded-xl p-5" id="staff-list-card">
          <div className="border-b border-white/10 pb-3 mb-4">
            <h3 className="font-display font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Hierarchie Active du Staff ({staffMembers.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">L'équipe administrative de l'île disposant d'un droit de modération.</p>
          </div>

          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {staffMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between gap-4 text-xs"
                id={`staff-member-row-${member.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150'}
                      alt={member.username}
                      className="w-9 h-9 rounded-full border border-slate-700 select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        member.isOnline
                          ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                          : 'bg-slate-600'
                      }`}
                      title={member.isOnline ? 'En temps réel : Connecté' : 'Hors ligne'}
                    ></span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-250 truncate">{member.username}</span>
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">ID Discord: {member.id}</div>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  {member.id !== currentUserId ? (
                    <button
                      onClick={() => handleRevoke(member.id)}
                      className="p-2 bg-rose-500/5 hover:bg-rose-500/25 border border-rose-500/15 rounded-lg text-rose-400 hover:text-rose-300 transition duration-150 cursor-pointer"
                      title="Retirer du staff immédiatement"
                      id={`btn-revoke-${member.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold font-mono bg-white/5 border border-white/5 px-2 py-1 rounded">
                      Vous (Owner)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
