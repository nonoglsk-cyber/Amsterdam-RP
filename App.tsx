import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import { Send, Clock, BookOpen, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';

interface CandidatePanelProps {
  onApplicationSubmitted: () => void;
  applications: Application[];
  userUsername: string;
}

export default function CandidatePanel({ onApplicationSubmitted, applications, userUsername }: CandidatePanelProps) {
  const [pseudoRoblox, setPseudoRoblox] = useState<string>('');
  const [pseudoDiscord, setPseudoDiscord] = useState<string>(userUsername || '');
  const [age, setAge] = useState<string>('');
  const [fuseauHoraire, setFuseauHoraire] = useState<string>('Paris (UTC+1)');
  const [disponibilites, setDisponibilites] = useState<string[]>([]);
  const [experienceStaff, setExperienceStaff] = useState<string>('');
  const [connaissanceCommandes, setConnaissanceCommandes] = useState<string>('');
  const [significationHrp, setSignificationHrp] = useState<string>('');
  const [pourquoiRejoindre, setPourquoiRejoindre] = useState<string>('');
  const [comportementPerturbateur, setComportementPerturbateur] = useState<string>('');
  const [comportementInapproprieMpj, setComportementInapproprieMpj] = useState<string>('');
  const [luReglement, setLuReglement] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const activeApp = applications.find(
    app => app.status === 'pending' || app.status === 'reading'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!pseudoRoblox.trim()) {
      setError('Le Pseudo Roblox est obligatoire.');
      return;
    }
    if (!pseudoDiscord.trim()) {
      setError('Le Pseudo Discord est obligatoire.');
      return;
    }
    if (!age) {
      setError('Votre âge réel est obligatoire.');
      return;
    }
    if (!luReglement) {
      setError('Le règlement du serveur et du jeu doit être approuvé (Avez-vous lu et compris les règles du serveur et du jeu ? * Oui).');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 99) {
      setError('Veuillez saisir un âge valide (12-99 ans).');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pseudoRoblox,
          pseudoDiscord,
          age: ageNum,
          fuseauHoraire,
          disponibilites,
          experienceStaff,
          connaissanceCommandes,
          significationHrp,
          pourquoiRejoindre,
          comportementPerturbateur,
          comportementInapproprieMpj,
          luReglement,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur serveur lors de la soumission.');
      }

      setSuccess(true);
      setPseudoRoblox('');
      setPseudoDiscord('');
      setAge('');
      setFuseauHoraire('Paris (UTC+1)');
      setDisponibilites([]);
      setExperienceStaff('');
      setConnaissanceCommandes('');
      setSignificationHrp('');
      setPourquoiRejoindre('');
      setComportementPerturbateur('');
      setComportementInapproprieMpj('');
      setLuReglement(false);
      onApplicationSubmitted();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            <span>En attente de traitement</span>
          </div>
        );
      case 'reading':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>En cours de lecture</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Candidature Acceptée !</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Candidature Refusée</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6" id="candidate-panel">
      {/* 1. Suivi d'activité en cours */}
      {applications.length > 0 && (
        <div className="glass rounded-xl p-5" id="applications-tracker">
          <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Historique de vos candidatures déposées</span>
          </h3>

          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="p-4 bg-black/20 border border-white/5 rounded-lg" id={`app-history-${app.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-slate-500">ID: #{app.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>

                {/* Message d'accompagnement en fonction du statut */}
                {app.status === 'pending' && (
                  <p className="text-xs text-amber-300 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 leading-relaxed mb-4">
                     🔒 Votre dossier est bien enregistré dans notre base de données. Un Modérateur ou un Administrateur examinera votre profil sous peu. Vous recevrez une notification webhook Discord dès qu'un statut sera publié.
                  </p>
                )}
                {app.status === 'reading' && (
                  <p className="text-xs text-blue-300 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 leading-relaxed mb-4">
                     📖 Bonne nouvelle ! Votre candidature est actuellement lue par un responsable du staff. Nous évaluons vos réponses.
                  </p>
                )}
                {app.status === 'accepted' && (
                  <p className="text-xs text-emerald-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 leading-relaxed mb-4">
                     🎉 **Félicitations, votre profil est accepté !** Nous vous invitons à présent à rejoindre le salon de recrutement Vocal sur Discord muni de l'ID de candidature <code className="font-mono bg-slate-900 border border-slate-800 px-1 rounded">{app.id}</code> pour passer l'entretien de validation.
                  </p>
                )}
                {app.status === 'rejected' && (
                  <p className="text-xs text-rose-300 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 leading-relaxed mb-4">
                     ❌ **Votre candidature n'a pas été retenue.** L'équipe a jugé vos réponses un peu trop succinctes ou insuffisantes. Vous pourrez soumettre à nouveau un dossier dans 14 jours.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white/5 border border-white/5 rounded">
                    <span className="font-bold text-slate-300 block mb-1">Pseudo Roblox :</span>
                    <span className="text-slate-400">{app.pseudoRoblox || app.username}</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded">
                    <span className="font-bold text-slate-300 block mb-1">Âge :</span>
                    <span className="text-slate-400">{app.age} ans</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded">
                    <span className="font-bold text-slate-300 block mb-1">Pseudo Discord :</span>
                    <span className="text-slate-400">{app.pseudoDiscord}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Formulaire si aucune candidature en attente brute n'est active */}
      {!activeApp ? (
        <form onSubmit={handleSubmit} className="space-y-6" id="form-recrutement">
          {/* Main Title & Description Panel */}
          <div className="bg-[#1e293b]/70 border-t-8 border-indigo-500 border border-white/5 rounded-xl p-6 shadow-xl space-y-4">
            <h2 className="font-display font-black text-2xl text-white tracking-tight leading-snug">
              Questionnaire de Candidature - Staff Amsterdam RP
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
              Ce questionnaire a pour but de mieux connaître les candidats souhaitant intégrer l'équipe staff du serveur Amsterdam RP. Nous cherchons des personnes responsables, impliquées, et qui respecte et écoute la communauté. Prenez le temps de répondre avec soin, chaque réponse compte !
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold" id="form-error">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold" id="form-success">
              Candidature déposée avec succès ! Notre webhook a notifié les responsables staff.
            </div>
          )}

          {/* Q1: Pseudo Roblox */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-pseudo-roblox" className="block text-sm font-semibold text-slate-100 font-sans">
                1. Pseudo Roblox <span className="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <input
              type="text"
              id="field-pseudo-roblox"
              value={pseudoRoblox}
              onChange={(e) => setPseudoRoblox(e.target.value)}
              placeholder="Réponse courte"
              className="w-full sm:w-2/3 bg-transparent border-b border-white/20 focus:border-indigo-500 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Q2: Pseudo Discord */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-pseudo-discord" className="block text-sm font-semibold text-slate-100 font-sans">
                2. Pseudo Discord <span className="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <input
              type="text"
              id="field-pseudo-discord"
              value={pseudoDiscord}
              onChange={(e) => setPseudoDiscord(e.target.value)}
              placeholder="Réponse courte"
              className="w-full sm:w-2/3 bg-transparent border-b border-white/20 focus:border-indigo-500 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition"
              required
            />
          </div>

          {/* Q3: Âge */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-age" className="block text-sm font-semibold text-slate-100 font-sans">
                3. Âge : <span className="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <input
              type="number"
              id="field-age"
              min="12"
              max="99"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Réponse courte"
              className="w-full sm:w-1/3 bg-transparent border-b border-white/20 focus:border-indigo-500 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition font-mono"
              required
            />
          </div>

          {/* Q4: Fuseau horaire */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-fuseau" className="block text-sm font-semibold text-slate-100 font-sans">
                4. Fuseau horaire
              </label>
            </div>
            <input
              type="text"
              id="field-fuseau"
              value={fuseauHoraire}
              onChange={(e) => setFuseauHoraire(e.target.value)}
              placeholder="Réponse longue ou courte"
              className="w-full sm:w-2/3 bg-transparent border-b border-white/20 focus:border-indigo-500 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Q5: Disponibilités (jours) */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-100 font-sans mb-1">
                5. Disponibilités (jours) :
              </label>
            </div>
            <div className="space-y-3">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day) => {
                const isChecked = disponibilites.includes(day);
                return (
                  <label key={day} className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setDisponibilites(disponibilites.filter(d => d !== day));
                        } else {
                          setDisponibilites([...disponibilites, day]);
                        }
                      }}
                      className="rounded border-white/10 w-4 h-4 bg-transparent text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span>{day}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Q6: Expérience staff */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-xp-staff" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                6. Avez-vous déjà occupé un poste de staff ou de modération sur Emergency Hamburg Si oui, décrivez votre expérience.
              </label>
            </div>
            <textarea
              id="field-xp-staff"
              rows={3}
              value={experienceStaff}
              onChange={(e) => setExperienceStaff(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q7: Commandes */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-commandes" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                7. Connaissez-vous des commandes si oui siter en 4
              </label>
            </div>
            <textarea
              id="field-commandes"
              rows={3}
              value={connaissanceCommandes}
              onChange={(e) => setConnaissanceCommandes(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q10: Signification HRP */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-hrp" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                10. Que signifient hrp pour vous
              </label>
            </div>
            <textarea
              id="field-hrp"
              rows={3}
              value={significationHrp}
              onChange={(e) => setSignificationHrp(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q8: Pourquoi rejoindre */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-pourquoi" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                8. Pourquoi souhaitez-vous rejoindre l'équipe staff de Amsterdam RP ?
              </label>
            </div>
            <textarea
              id="field-pourquoi"
              rows={3}
              value={pourquoiRejoindre}
              onChange={(e) => setPourquoiRejoindre(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q9: Joueur perturbateur */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-perturbateur" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                9. Un joueur ne respecte pas les règles RP et perturbe les autres. Que faites-vous ?
              </label>
            </div>
            <textarea
              id="field-perturbateur"
              rows={3}
              value={comportementPerturbateur}
              onChange={(e) => setComportementPerturbateur(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q11: Comportement inapproprié Discord privé */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label htmlFor="field-discord-inapproprie" className="block text-sm font-semibold text-slate-100 font-sans leading-relaxed">
                11. Un joueur signale un comportement inapproprié en privé sur Discord. Comment traitez-vous la situation ?
              </label>
            </div>
            <textarea
              id="field-discord-inapproprie"
              rows={3}
              value={comportementInapproprieMpj}
              onChange={(e) => setComportementInapproprieMpj(e.target.value)}
              placeholder="Réponse longue"
              className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 py-2 text-xs text-slate-200 placeholder:text-slate-550 focus:outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Q12: Lu et compris les règles */}
          <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-6 shadow-md space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-100 font-sans">
                12. Avez-vous lu et compris les règles du serveur et du jeu ? <span className="text-rose-500 font-bold">*</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition">
                <input
                  type="radio"
                  name="field-lu-regles"
                  checked={luReglement}
                  onChange={() => setLuReglement(true)}
                  className="rounded-full border-white/10 w-4 h-4 bg-transparent text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Oui</span>
              </label>
            </div>
          </div>

          {/* Footer informational Google Forms message */}
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
            <p className="text-xs italic text-slate-300 leading-normal font-sans">
              Merci d'avoir complété ce questionnaire. L'équipe administrative vous contactera prochainement si votre candidature est retenue.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Description (facultative)
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase rounded-xl transition duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
            id="btn-submit-candidature"
          >
            {submitting ? (
              <span>Soumission de vos réponses...</span>
            ) : (
              <>
                <Send className="w-4 h-4 animate-bounce" />
                <span>Soumettre le formulaire</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="p-6 glass rounded-xl text-center text-slate-300" id="blocked-candidat-panel">
          <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-pulse" />
          <h4 className="font-display font-bold text-base mb-2">Traitement de candidature en cours</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Vous avez déjà un dossier actif (<span className="text-indigo-400 font-semibold">{activeApp.status === 'pending' ? 'En attente' : 'En cours de lecture'}</span>).
            Vous ne pouvez pas soumettre une nouvelle candidature tant que le staff n'a pas statué sur celle-ci.
          </p>
        </div>
      )}
    </div>
  );
}
