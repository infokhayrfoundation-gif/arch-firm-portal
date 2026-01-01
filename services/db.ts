
import { User, Project, Appointment, Proposal, Update, PaymentRecord, ProjectStatus, InitialForm, AvailabilityRecord, UserRole } from '../types';

const MOCK_SUPERADMIN: User = {
  id: 'superadmin-1',
  name: 'Anjola',
  email: 'anjola@atelieranj.com',
  password: 'password123',
  phone: '555-0123',
  role: 'superadmin',
  created_projects: [],
  photo: 'https://picsum.photos/200'
};

const MOCK_CLIENT: User = {
  id: 'client-demo-1',
  name: 'Demo Client',
  email: 'client@example.com',
  password: 'password123',
  phone: '555-9999',
  role: 'client',
  created_projects: ['proj-demo-1'],
  photo: 'https://picsum.photos/200'
};

const MOCK_PROJECT: Project = {
  id: 'proj-demo-1',
  client_id: 'client-demo-1',
  project_title: 'Minimalist Lakehouse',
  status: 'Proposal Sent',
  initial_form: {
    project_title: 'Minimalist Lakehouse',
    project_location: 'Epe, Lagos',
    project_type: 'Residential',
    budget: 45000000,
    timeline: '12 Months',
    requirements: 'A 4-bedroom sustainable home with panoramic lake views and brutalist concrete finishes.',
    inspiration_images: [],
    submitted_at: new Date().toISOString()
  },
  construction_updates: [],
  percent_complete: 5,
  created_at: new Date().toISOString(),
  payment_status: 'unpaid',
  concept_is_approved: false,
  proposal: {
    id: 'prop-demo-1',
    project_id: 'proj-demo-1',
    proposal_file: 'proposal.pdf',
    amount: 15000000,
    validity_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'sent',
    sent_at: new Date().toISOString(),
    created_by_id: 'superadmin-1'
  }
};

const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

class MockDB {
  private users: User[] = [];
  private projects: Project[] = [];
  private availability: AvailabilityRecord[] = [];

  constructor() {
    this.load();
    if (this.users.length === 0) {
      this.users = [MOCK_SUPERADMIN, MOCK_CLIENT];
      this.projects = [MOCK_PROJECT];
      this.save();
    }
  }

  private load() {
    const u = localStorage.getItem('atelier_users');
    const p = localStorage.getItem('atelier_projects');
    const a = localStorage.getItem('atelier_availability');
    this.users = u ? JSON.parse(u) : [];
    this.projects = p ? JSON.parse(p) : [];
    this.availability = a ? JSON.parse(a) : [];
  }

  private save() {
    localStorage.setItem('atelier_users', JSON.stringify(this.users));
    localStorage.setItem('atelier_projects', JSON.stringify(this.projects));
    localStorage.setItem('atelier_availability', JSON.stringify(this.availability));
  }

  // --- User Operations ---
  login(email: string, password: string, role: string): User | null {
    const cleanEmail = email.trim().toLowerCase();
    const staffRoles: UserRole[] = ['superadmin', 'worker', 'project_manager', 'inspector'];
    const user = this.users.find(u => {
      const basicMatch = u.email.trim().toLowerCase() === cleanEmail && u.password === password;
      if (!basicMatch) return false;
      if (role === 'admin') return staffRoles.includes(u.role);
      return u.role === role;
    });
    return user || null;
  }

  signup(data: Partial<User>): User {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const existing = this.users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existing) throw new Error('Email already registered');
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name || '',
        email: cleanEmail,
        password: data.password || '',
        phone: data.phone || '',
        role: data.role as UserRole || 'client',
        created_projects: [],
        photo: 'https://picsum.photos/200'
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserPassword(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (user) { user.password = password; this.save(); }
    else throw new Error('User not found');
  }

  getUser(id: string) { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase()); }

  // --- Project Operations ---
  createProject(clientId: string, form: InitialForm): Project {
    const project: Project = {
      id: `proj-${Date.now()}`,
      client_id: clientId,
      project_title: form.project_title,
      status: 'Appointment Needed',
      initial_form: form,
      construction_updates: [],
      percent_complete: 0,
      created_at: new Date().toISOString(),
      payment_status: 'unpaid',
      concept_is_approved: false
    };
    this.projects.push(project);
    const user = this.users.find(u => u.id === clientId);
    if (user) user.created_projects.push(project.id);
    this.save();
    return project;
  }

  getProjects(userId?: string, role?: string): Project[] {
    if (['superadmin', 'worker', 'project_manager', 'inspector'].includes(role || '')) return this.projects;
    return this.projects.filter(p => p.client_id === userId);
  }

  getProjectById(id: string): Project | undefined { return this.projects.find(p => p.id === id); }

  updateProject(id: string, updates: Partial<Project>): Project {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    this.projects[idx] = { ...this.projects[idx], ...updates };
    this.save();
    return this.projects[idx];
  }

  // --- Workflow Actions ---
  bookAppointment(projectId: string, date: string, time: string, clientId: string): Appointment {
    let isoDateTime = new Date().toISOString();
    try { isoDateTime = new Date(`${date}T${time}`).toISOString(); } catch (e) {}
    const appointment: Appointment = { id: `apt-${Date.now()}`, client_id: clientId, date, time, datetime: isoDateTime, status: 'pending' };
    this.updateProject(projectId, { appointment, status: 'Appointment Needed' });
    return appointment;
  }

  confirmAppointment(projectId: string) {
    const project = this.getProjectById(projectId);
    if (project && project.appointment) {
      const updatedApt: Appointment = { ...project.appointment, status: 'confirmed' };
      this.updateProject(projectId, { appointment: updatedApt, status: 'Consultation Done' });
    }
  }

  sendProposal(projectId: string, amount: number, fileUrl: string, userId: string) {
    const user = this.getUser(userId);
    const project = this.getProjectById(projectId);
    const isSuper = user?.role === 'superadmin';
    const proposal: Proposal = {
      id: `prop-${Date.now()}`,
      project_id: projectId,
      proposal_file: fileUrl,
      amount,
      validity_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      status: isSuper ? 'sent' : 'pending_approval',
      sent_at: new Date().toISOString(),
      created_by_id: userId
    };
    this.updateProject(projectId, {
      proposal,
      invoice_amount: amount,
      status: isSuper ? 'Proposal Sent' : project?.status as ProjectStatus || 'Consultation Done',
      payment_status: 'unpaid'
    });
  }

  approveProposal(projectId: string) {
    const project = this.getProjectById(projectId);
    if (project && project.proposal) {
      this.updateProject(projectId, {
        proposal: { ...project.proposal, status: 'sent' },
        status: 'Proposal Sent'
      });
    }
  }

  requestProposalRevision(projectId: string, notes: string) {
    const project = this.getProjectById(projectId);
    if (project && project.proposal) {
      this.updateProject(projectId, {
        status: 'Proposal Revision',
        proposal: { ...project.proposal, status: 'revision_requested', revision_notes: notes }
      });
    }
  }

  makePayment(projectId: string, amount: number) {
    this.updateProject(projectId, { payment_status: 'pending_verification' });
  }

  verifyPayment(projectId: string) {
    this.updateProject(projectId, { payment_status: 'paid', status: 'Paid' });
  }

  shareConcept(projectId: string, files: string[], link: string, userId: string) {
    const user = this.getUser(userId);
    const project = this.getProjectById(projectId);
    const isSuper = user?.role === 'superadmin';
    this.updateProject(projectId, {
      concept_design_file: files,
      concept_canva_link: link,
      concept_is_approved: isSuper,
      status: isSuper ? 'Concept Shared' : project?.status as ProjectStatus || 'Paid',
      client_approval: undefined
    });
  }

  approveConcept(projectId: string) {
    this.updateProject(projectId, { concept_is_approved: true, status: 'Concept Shared' });
  }

  approveClientConcept(projectId: string) {
    this.updateProject(projectId, { client_approval: 'yes', status: 'Concept Approved' });
  }

  addUpdate(projectId: string, updateData: Omit<Update, 'is_approved'>, userId: string) {
    const user = this.getUser(userId);
    const isSuper = user?.role === 'superadmin';
    const project = this.getProjectById(projectId);
    if (project) {
        const update: Update = { ...updateData, is_approved: isSuper };
        const newUpdates = [update, ...project.construction_updates];
        let newStatus = project.status;
        if (isSuper && project.status !== 'Handover' && project.status !== 'Completed') {
            newStatus = update.progress_percentage >= 100 ? 'Inspection' : 'Construction';
        }
        this.updateProject(projectId, {
            construction_updates: newUpdates,
            percent_complete: isSuper ? update.progress_percentage : project.percent_complete,
            status: newStatus
        });
    }
  }

  approveSiteUpdate(projectId: string, updateId: string) {
    const project = this.getProjectById(projectId);
    if (project) {
      const updates = project.construction_updates.map(u => u.id === updateId ? { ...u, is_approved: true } : u);
      const approvedUpdate = updates.find(u => u.id === updateId);
      this.updateProject(projectId, {
        construction_updates: updates,
        percent_complete: approvedUpdate?.progress_percentage || project.percent_complete,
        status: approvedUpdate?.progress_percentage! >= 100 ? 'Inspection' : 'Construction'
      });
    }
  }

  finalizeHandover(projectId: string) {
    this.updateProject(projectId, { status: 'Completed', completion_date: new Date().toISOString() });
  }

  getStaff(): User[] { return this.users.filter(u => u.role !== 'client'); }
  createWorker(data: Partial<User>) {
    const u: User = { id: `w-${Date.now()}`, name: data.name!, email: data.email!, password: data.password!, phone: data.phone!, role: 'worker', created_projects: [] };
    this.users.push(u); this.save(); return u;
  }

  getAvailability() { return this.availability; }
  setAvailability(records: AvailabilityRecord[]) { this.availability = records; this.save(); }
  isDateAvailable(dateStr: string) {
    const override = this.availability.find(a => a.date === dateStr);
    if (override) return { available: override.slots.length > 0, slots: override.slots };
    const date = new Date(dateStr);
    const day = date.getDay(); 
    const isWeekday = day !== 0 && day !== 6;
    return { available: isWeekday, slots: isWeekday ? DEFAULT_SLOTS : [] };
  }
}

export const db = new MockDB();
