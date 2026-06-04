import React, { useState } from 'react';
import { Terminal, Database, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';

export default function MySQLSchemaDocs() {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `
-- =========================================================
-- Schéma SQL pour Plateforme de Recrutement & Staff
-- Compatible avec bases de données Roblox ou Autonome
-- =========================================================

-- 1. Table des Utilisateurs (Synchronisée avec Discord OAuth2)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'ID Unique Discord',
  \`username\` VARCHAR(100) NOT NULL COMMENT 'Pseudo Discord ou RP',
  \`avatar\` VARCHAR(255) DEFAULT NULL COMMENT 'Lien HTTP vers avatar Discord',
  \`role\` ENUM('user', 'modo', 'admin', 'gerant', 'fondation') DEFAULT 'user' COMMENT 'Rôle d\\'accès du panel',
  \`joined_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des Candidatures (Soumises par les candidats des serveurs RP)
CREATE TABLE IF NOT EXISTS \`applications\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT 'UUID de la candidature',
  \`user_id\` VARCHAR(64) NOT NULL COMMENT 'ID Discord de l\\'auteur',
  \`age\` INT NOT NULL COMMENT 'Age du candidat',
  \`dispo\` TEXT NOT NULL COMMENT 'Disponibilités du joueur',
  \`xp\` TEXT NOT NULL COMMENT 'Expérience RP du joueur',
  \`motivations\` TEXT NOT NULL COMMENT 'Motivations pour rejoindre le staff',
  \`status\` ENUM('pending', 'reading', 'accepted', 'rejected') DEFAULT 'pending' COMMENT 'Statut réel',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des Commentaires Staff (Notes internes sur les profils des candidats)
CREATE TABLE IF NOT EXISTS \`application_comments\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`application_id\` VARCHAR(64) NOT NULL,
  \`staff_id\` VARCHAR(64) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`staff_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des Journaux de Modération (Audit Trail contre les abus de pouvoir)
CREATE TABLE IF NOT EXISTS \`moderation_logs\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`action\` VARCHAR(255) NOT NULL COMMENT 'Détail textuel de l\\'action critique',
  \`staff_id\` VARCHAR(64) NOT NULL COMMENT 'Auteur de l\\'action',
  \`target_id\` VARCHAR(64) DEFAULT NULL COMMENT 'Utilisateur ou App ciblé',
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`staff_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexation d\\'optimisation pour requêtes rapides de jointure
CREATE INDEX idx_app_status ON \`applications\` (\`status\`);
CREATE INDEX idx_user_role ON \`users\` (\`role\`);
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-6 text-slate-100 animate-fade-in" id="mysql-schema-docs">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Structure MySQL recommandée</h2>
            <p className="text-xs text-slate-400">Schéma SQL optimisé pour la synchronisation avec votre outil de jeu Emergency Hamburg (Roblox)</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 transition border border-white/10 rounded-lg text-xs"
          id="btn-copy-sql"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Copié dans le presse-papiers !</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copier le code DDL MySQL</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-black/20 border border-white/5 rounded-lg">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invariants de Données</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Une candidature ne peut exister sans un compte utilisateur Discord valide. La suppression d'un compte utilisateur cascade la suppression de ses candidatures associées.
          </p>
        </div>
        <div className="p-4 bg-black/20 border border-white/5 rounded-lg">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Sélection de Rôles</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Le rôle initial par défaut is <code className="text-indigo-300 font-mono">user</code>. Seul l'accès via le grade de Fondation ou d'Owner peut changer les rôles pour éviter l'escalade de privilèges.
          </p>
        </div>
        <div className="p-4 bg-black/20 border border-white/5 rounded-lg">
          <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">Audit Trail Mandataire</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            La table <code className="text-rose-300 font-mono">moderation_logs</code> stocke de manière autonome chaque promotion, révocation, modification de statut ou commentaire interne rédigé.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded">
          <Terminal className="w-3 h-3" />
          <span>MYSQL DDL SCHEMA</span>
        </div>
        <pre className="p-4 bg-black/35 text-slate-300 border border-white/10 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96">
          {sqlSchema}
        </pre>
      </div>

      <div className="mt-5 p-4 bg-white/5 border border-white/5 rounded-lg flex gap-3 text-amber-250">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold mb-1">Conseil de Sécurité Intégration RP</h4>
          <p className="opacity-90 leading-relaxed">
            Pour lier ce panel avec votre serveur Roblox (Emergency Hamburg), configurez l'ID Discord comme clé de liaison primaire dans votre base de données ou votre API de jeu principale. Ne stockez jamais vos identifiants SQL bruts ou tokens Discord en clair dans les dépôts GitHub publics.
          </p>
        </div>
      </div>
    </div>
  );
}
