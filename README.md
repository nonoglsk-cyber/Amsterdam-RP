import fs from 'fs';
import path from 'path';
import { User, Application, ModerationLog, StaffRole, Comment, ApplicationStatus } from './src/types';

const DB_FILE = path.join(process.cwd(), 'database.json');

interface DatabaseSchema {
  users: Record<string, User>;
  applications: Application[];
  logs: ModerationLog[];
}

// Initial base mock data to populate our simulated Roblox Emergency Hamburg database
// to make the preview extremely functional and impressive right away.
const INITIAL_DB: DatabaseSchema = {
  users: {
    '1314537790813241384': {
      id: '1314537790813241384',
      username: 'Owner_Principal',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
      role: 'fondation',
      joinedAt: new Date().toISOString(),
    },
    '800123532394364948': {
      id: '800123532394364948',
      username: 'Owner_Co',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150',
      role: 'fondation',
      joinedAt: new Date().toISOString(),
    },
    '1334945011728646217': {
      id: '1334945011728646217',
      username: 'Owner_Directeur',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150',
      role: 'fondation',
      joinedAt: new Date().toISOString(),
    }
  },
  applications: [],
  logs: []
};

class DBManager {
  private schema: DatabaseSchema;

  constructor() {
    this.schema = { ...INITIAL_DB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la base de données:', e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de la base de données:', e);
    }
  }

  public getUsers(): User[] {
    return Object.values(this.schema.users);
  }

  public getUser(id: string): User | null {
    return this.schema.users[id] || null;
  }

  public getOrCreateUser(discordId: string, username: string, avatar: string | null): User {
    if (!this.schema.users[discordId]) {
      this.schema.users[discordId] = {
        id: discordId,
        username,
        avatar,
        role: 'user',
        joinedAt: new Date().toISOString(),
      };
      this.save();
    } else {
      // Mettre à jour les informations de profil Discord au passage
      const user = this.schema.users[discordId];
      user.username = username;
      user.avatar = avatar;
      this.save();
    }
    return this.schema.users[discordId];
  }

  public promoteUser(userId: string, role: StaffRole, staffId: string, staffUsername: string): { success: boolean; user?: User } {
    const user = this.schema.users[userId];
    if (!user) return { success: false };

    user.role = role;
    this.save();

    // Ajouter un log
    this.addLog(
      `Rôle mis à jour : ${user.username} promu/assigné au rôle ${role.toUpperCase()}`,
      staffId,
      staffUsername,
      userId,
      user.username
    );

    return { success: true, user };
  }

  public revokeUser(userId: string, staffId: string, staffUsername: string): { success: boolean; user?: User } {
    const user = this.schema.users[userId];
    if (!user) return { success: false };

    const oldRole = user.role;
    user.role = 'user';
    this.save();

    this.addLog(
      `Révocation Staff : Accès de ${user.username} retirés (Était ${oldRole.toUpperCase()})`,
      staffId,
      staffUsername,
      userId,
      user.username
    );

    return { success: true, user };
  }

  public getApplications(): Application[] {
    return this.schema.applications;
  }

  public getApplicationsForUser(userId: string): Application[] {
    return this.schema.applications.filter(app => app.userId === userId);
  }

  public createApplication(
    userId: string,
    fields: {
      pseudoRoblox: string;
      pseudoDiscord: string;
      age: number;
      fuseauHoraire: string;
      disponibilites: string[];
      experienceStaff: string;
      connaissanceCommandes: string;
      significationHrp: string;
      pourquoiRejoindre: string;
      comportementPerturbateur: string;
      comportementInapproprieMpj: string;
      luReglement: boolean;
    }
  ): Application {
    const user = this.getUser(userId);
    const username = user ? user.username : 'Inconnu';
    const avatar = user ? user.avatar : null;

    const newApp: Application = {
      id: 'app_' + Math.random().toString(36).substring(2, 11),
      userId,
      username,
      avatar,
      pseudoRoblox: fields.pseudoRoblox,
      pseudoDiscord: fields.pseudoDiscord,
      age: fields.age,
      fuseauHoraire: fields.fuseauHoraire,
      disponibilites: fields.disponibilites,
      experienceStaff: fields.experienceStaff,
      connaissanceCommandes: fields.connaissanceCommandes,
      significationHrp: fields.significationHrp,
      pourquoiRejoindre: fields.pourquoiRejoindre,
      comportementPerturbateur: fields.comportementPerturbateur,
      comportementInapproprieMpj: fields.comportementInapproprieMpj,
      luReglement: fields.luReglement,
      status: 'pending',
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.schema.applications.push(newApp);
    this.save();

    this.addLog(
      `Nouvelle candidature soumise : ${fields.pseudoRoblox} (${fields.age} ans)`,
      userId,
      username,
      newApp.id,
      username
    );

    return newApp;
  }

  public updateApplicationStatus(
    appId: string,
    status: ApplicationStatus,
    staffId: string,
    staffUsername: string
  ): { success: boolean; application?: Application } {
    const app = this.schema.applications.find(a => a.id === appId);
    if (!app) return { success: false };

    const oldStatus = app.status;
    app.status = status;
    app.updatedAt = new Date().toISOString();
    this.save();

    this.addLog(
      `Statut candidature modifié : ${oldStatus} -> ${status}`,
      staffId,
      staffUsername,
      app.userId,
      app.username
    );

    return { success: true, application: app };
  }

  public addComment(
    appId: string,
    staffId: string,
    staffUsername: string,
    content: string
  ): { success: boolean; comment?: Comment } {
    const app = this.schema.applications.find(a => a.id === appId);
    if (!app) return { success: false };

    const newComment: Comment = {
      id: 'comm_' + Math.random().toString(36).substring(2, 11),
      staffId,
      staffUsername,
      content,
      createdAt: new Date().toISOString(),
    };

    app.comments.push(newComment);
    app.updatedAt = new Date().toISOString();
    this.save();

    this.addLog(
      `Commentaire interne ajouté sur la candidature de ${app.username}`,
      staffId,
      staffUsername,
      app.userId,
      app.username
    );

    return { success: true, comment: newComment };
  }

  public getLogs(): ModerationLog[] {
    return [...this.schema.logs].reverse(); // Renvoyer du plus récent au plus ancien
  }

  public addLog(
    action: string,
    staffId: string,
    staffUsername: string,
    targetId: string | null = null,
    targetUsername: string | null = null
  ): ModerationLog {
    const newLog: ModerationLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      action,
      staffId,
      staffUsername,
      targetId,
      targetUsername,
      timestamp: new Date().toISOString(),
    };

    this.schema.logs.push(newLog);
    this.save();
    return newLog;
  }
}

export const dbStore = new DBManager();
