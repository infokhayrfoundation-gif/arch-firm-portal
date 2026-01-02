import { User, Project, Appointment, Proposal, Update, PaymentRecord, ProjectStatus, InitialForm, AvailabilityRecord, UserRole } from '../types';
import { supabase } from './supabase';

// Supabase-based database service - replaces localStorage implementation
// All methods are async because Supabase operations are asynchronous
class SupabaseDB {
  // --- User Operations ---
  async login(email: string, password: string, role: string): Promise<User | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', password)
        .single();

      if (error || !data) return null;

      const user = data as User;
      const staffRoles: UserRole[] = ['superadmin', 'worker', 'project_manager', 'inspector'];
      
      if (role === 'admin' && !staffRoles.includes(user.role)) return null;
      if (role !== 'admin' && user.role !== role) return null;

      return user;
    } catch (e) {
      console.error('Login error:', e);
      return null;
    }
  }

  async signup(data: Partial<User>): Promise<User> {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single();

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

    const { error } = await supabase.from('users').insert([newUser]);
    if (error) throw error;

    return newUser;
  }

  async updateUserPassword(email: string, password: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase
      .from('users')
      .update({ password })
      .eq('email', cleanEmail);

    if (error) throw new Error('User not found');
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return data as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const cleanEmail = email.trim().toLowerCase();
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    return data as User | undefined;
  }

  // --- Project Operations ---
  async createProject(clientId: string, form: InitialForm): Promise<Project> {
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

    const { error: projectError } = await supabase
      .from('projects')
      .insert([{
        id: project.id,
        client_id: project.client_id,
        project_title: project.project_title,
        status: project.status,
        initial_form: project.initial_form,
        construction_updates: project.construction_updates,
        percent_complete: project.percent_complete,
        created_at: project.created_at,
        payment_status: project.payment_status,
        concept_is_approved: project.concept_is_approved
      }]);

    if (projectError) throw projectError;

    // Update user's created_projects
    const user = await this.getUser(clientId);
    if (user) {
      const updatedProjects = [...(user.created_projects || []), project.id];
      await supabase
        .from('users')
        .update({ created_projects: updatedProjects })
        .eq('id', clientId);
    }

    return project;
  }

  async getProjects(userId?: string, role?: string): Promise<Project[]> {
    try {
      let query = supabase.from('projects').select('*');

      if (['superadmin', 'worker', 'project_manager', 'inspector'].includes(role || '')) {
        // Staff can see all projects
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return this.mapProjectsFromDB(data || []);
      } else if (userId) {
        // Clients see only their projects
        const { data, error } = await query.eq('client_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return this.mapProjectsFromDB(data || []);
      }

      return [];
    } catch (e) {
      console.error('Get projects error:', e);
      return [];
    }
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapProjectFromDB(data);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const dbUpdate: any = {};
    
    // Map Project fields to database columns
    if (updates.status !== undefined) dbUpdate.status = updates.status;
    if (updates.project_title !== undefined) dbUpdate.project_title = updates.project_title;
    if (updates.initial_form !== undefined) dbUpdate.initial_form = updates.initial_form;
    if (updates.appointment !== undefined) dbUpdate.appointment = updates.appointment;
    if (updates.consultation_notes !== undefined) dbUpdate.consultation_notes = updates.consultation_notes;
    if (updates.proposal !== undefined) dbUpdate.proposal = updates.proposal;
    if (updates.invoice_amount !== undefined) dbUpdate.invoice_amount = updates.invoice_amount;
    if (updates.payment_status !== undefined) dbUpdate.payment_status = updates.payment_status;
    if (updates.concept_design_file !== undefined) dbUpdate.concept_design_file = updates.concept_design_file;
    if (updates.concept_canva_link !== undefined) dbUpdate.concept_canva_link = updates.concept_canva_link;
    if (updates.concept_is_approved !== undefined) dbUpdate.concept_is_approved = updates.concept_is_approved;
    if (updates.client_approval !== undefined) dbUpdate.client_approval = updates.client_approval;
    if (updates.client_change_request_notes !== undefined) dbUpdate.client_change_request_notes = updates.client_change_request_notes;
    if (updates.client_change_request_files !== undefined) dbUpdate.client_change_request_files = updates.client_change_request_files;
    if (updates.construction_updates !== undefined) dbUpdate.construction_updates = updates.construction_updates;
    if (updates.percent_complete !== undefined) dbUpdate.percent_complete = updates.percent_complete;
    if (updates.handover_file !== undefined) dbUpdate.handover_file = updates.handover_file;
    if (updates.completion_date !== undefined) dbUpdate.completion_date = updates.completion_date;

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapProjectFromDB(data);
  }

  // Helper methods to map between DB format and Project type
  private mapProjectFromDB(dbProject: any): Project {
    return {
      id: dbProject.id,
      client_id: dbProject.client_id,
      project_title: dbProject.project_title,
      status: dbProject.status,
      initial_form: dbProject.initial_form || undefined,
      appointment: dbProject.appointment || undefined,
      consultation_notes: dbProject.consultation_notes,
      proposal: dbProject.proposal || undefined,
      invoice_amount: dbProject.invoice_amount,
      payment_status: dbProject.payment_status,
      concept_design_file: dbProject.concept_design_file,
      concept_canva_link: dbProject.concept_canva_link,
      concept_is_approved: dbProject.concept_is_approved || false,
      client_approval: dbProject.client_approval,
      client_change_request_notes: dbProject.client_change_request_notes,
      client_change_request_files: dbProject.client_change_request_files,
      construction_updates: dbProject.construction_updates || [],
      percent_complete: dbProject.percent_complete || 0,
      handover_file: dbProject.handover_file,
      completion_date: dbProject.completion_date,
      created_at: dbProject.created_at
    };
  }

  private mapProjectsFromDB(dbProjects: any[]): Project[] {
    return dbProjects.map(p => this.mapProjectFromDB(p));
  }

  // --- Workflow Actions ---
  async bookAppointment(projectId: string, date: string, time: string, clientId: string): Promise<Appointment> {
    const isoDateTime = new Date(`${date}T${time}`).toISOString();
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      client_id: clientId,
      date,
      time,
      datetime: isoDateTime,
      status: 'pending'
    };
    await this.updateProject(projectId, { appointment, status: 'Appointment Needed' });
    return appointment;
  }

  async confirmAppointment(projectId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (project && project.appointment) {
      const updatedApt: Appointment = { ...project.appointment, status: 'confirmed' };
      await this.updateProject(projectId, { appointment: updatedApt, status: 'Consultation Done' });
    }
  }

  async sendProposal(projectId: string, amount: number, fileUrl: string, userId: string): Promise<void> {
    const user = await this.getUser(userId);
    const project = await this.getProjectById(projectId);
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

    await this.updateProject(projectId, {
      proposal,
      invoice_amount: amount,
      status: isSuper ? 'Proposal Sent' : (project?.status as ProjectStatus || 'Consultation Done'),
      payment_status: 'unpaid'
    });
  }

  async approveProposal(projectId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (project && project.proposal) {
      await this.updateProject(projectId, {
        proposal: { ...project.proposal, status: 'sent' },
        status: 'Proposal Sent'
      });
    }
  }

  async requestProposalRevision(projectId: string, notes: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (project && project.proposal) {
      await this.updateProject(projectId, {
        status: 'Proposal Revision',
        proposal: { ...project.proposal, status: 'revision_requested', revision_notes: notes }
      });
    }
  }

  async makePayment(projectId: string, amount: number): Promise<void> {
    await this.updateProject(projectId, { payment_status: 'pending_verification' });
  }

  async verifyPayment(projectId: string): Promise<void> {
    await this.updateProject(projectId, { payment_status: 'paid', status: 'Paid' });
  }

  async shareConcept(projectId: string, files: string[], link: string, userId: string): Promise<void> {
    const user = await this.getUser(userId);
    const project = await this.getProjectById(projectId);
    const isSuper = user?.role === 'superadmin';
    
    await this.updateProject(projectId, {
      concept_design_file: files,
      concept_canva_link: link,
      concept_is_approved: isSuper,
      status: isSuper ? 'Concept Shared' : (project?.status as ProjectStatus || 'Paid'),
      client_approval: undefined
    });
  }

  async approveConcept(projectId: string): Promise<void> {
    await this.updateProject(projectId, { concept_is_approved: true, status: 'Concept Shared' });
  }

  async approveClientConcept(projectId: string): Promise<void> {
    await this.updateProject(projectId, { client_approval: 'yes', status: 'Concept Approved' });
  }

  async addUpdate(projectId: string, updateData: Omit<Update, 'is_approved'>, userId: string): Promise<void> {
    const user = await this.getUser(userId);
    const project = await this.getProjectById(projectId);
    if (!project) return;

    const isSuper = user?.role === 'superadmin';
    const update: Update = { ...updateData, is_approved: isSuper };
    const newUpdates = [update, ...project.construction_updates];
    let newStatus = project.status;
    
    if (isSuper && project.status !== 'Handover' && project.status !== 'Completed') {
      newStatus = update.progress_percentage >= 100 ? 'Inspection' : 'Construction';
    }

    await this.updateProject(projectId, {
      construction_updates: newUpdates,
      percent_complete: isSuper ? update.progress_percentage : project.percent_complete,
      status: newStatus
    });
  }

  async approveSiteUpdate(projectId: string, updateId: string): Promise<void> {
    const project = await this.getProjectById(projectId);
    if (!project) return;

    const updates = project.construction_updates.map(u =>
      u.id === updateId ? { ...u, is_approved: true } : u
    );
    const approvedUpdate = updates.find(u => u.id === updateId);

    await this.updateProject(projectId, {
      construction_updates: updates,
      percent_complete: approvedUpdate?.progress_percentage || project.percent_complete,
      status: approvedUpdate?.progress_percentage! >= 100 ? 'Inspection' : 'Construction'
    });
  }

  async finalizeHandover(projectId: string): Promise<void> {
    await this.updateProject(projectId, {
      status: 'Completed',
      completion_date: new Date().toISOString()
    });
  }

  async getStaff(): Promise<User[]> {
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('role', ['superadmin', 'worker', 'project_manager', 'inspector']);

    return (data || []) as User[];
  }

  async createWorker(data: Partial<User>): Promise<User> {
    const u: User = {
      id: `w-${Date.now()}`,
      name: data.name!,
      email: data.email!,
      password: data.password!,
      phone: data.phone!,
      role: 'worker',
      created_projects: []
    };

    const { error } = await supabase.from('users').insert([u]);
    if (error) throw error;

    return u;
  }

  async getAvailability(): Promise<AvailabilityRecord[]> {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .order('date', { ascending: true });

    return (data || []).map((a: any) => ({
      date: a.date,
      slots: a.slots
    }));
  }

  async setAvailability(records: AvailabilityRecord[]): Promise<void> {
    // Delete all existing records
    await supabase.from('availability').delete().neq('id', '');

    // Insert new records
    if (records.length > 0) {
      const { error } = await supabase.from('availability').insert(records);
      if (error) throw error;
    }
  }

  async isDateAvailable(dateStr: string): Promise<{ available: boolean; slots: string[] }> {
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('date', dateStr)
      .single();

    if (data) {
      return { available: (data.slots || []).length > 0, slots: data.slots || [] };
    }

    // Default: weekdays are available
    const date = new Date(dateStr);
    const day = date.getDay();
    const isWeekday = day !== 0 && day !== 6;
    const DEFAULT_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return { available: isWeekday, slots: isWeekday ? DEFAULT_SLOTS : [] };
  }
}

// Export a singleton instance
export const db = new SupabaseDB();
