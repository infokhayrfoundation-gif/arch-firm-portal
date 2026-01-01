
export type UserRole = 'client' | 'superadmin' | 'worker' | 'inspector' | 'project_manager';

export type ProjectStatus = 
  | 'Initial Form' 
  | 'Appointment Needed' 
  | 'Consultation Done'
  | 'Proposal Sent' 
  | 'Proposal Revision'
  | 'Payment Pending' 
  | 'Paid' 
  | 'Concept Shared'
  | 'Concept Approved' 
  | 'Construction' 
  | 'Inspection' 
  | 'Handover' 
  | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  photo?: string;
  company?: string;
  created_projects: string[];
}

export interface AvailabilityRecord {
  date: string; // YYYY-MM-DD
  slots: string[]; // e.g. ["09:00", "10:00"]
}

export interface InitialForm {
  project_title: string;
  project_location: string;
  project_type: string;
  budget: number;
  timeline: string;
  requirements: string;
  inspiration_images: string[];
  submitted_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  staff_id?: string;
  date: string;
  time: string;
  datetime: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  notes?: string;
}

export interface Proposal {
  id: string;
  project_id: string;
  proposal_file: string;
  amount: number;
  validity_date: string;
  status: 'sent' | 'accepted' | 'rejected' | 'revision_requested' | 'pending_approval';
  sent_at: string;
  revision_notes?: string;
  created_by_id: string;
}

export interface Update {
  id: string;
  project_id: string;
  update_title: string;
  update_notes: string;
  progress_images: string[];
  progress_percentage: number;
  created_by_id: string;
  created_at: string;
  is_approved: boolean;
}

export interface PaymentRecord {
  id: string;
  project_id: string;
  amount: number;
  gateway: 'Stripe' | 'Paystack';
  status: 'pending' | 'success' | 'failed';
  transaction_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  project_title: string;
  status: ProjectStatus;
  initial_form?: InitialForm;
  appointment?: Appointment;
  consultation_notes?: string;
  proposal?: Proposal;
  invoice_amount?: number;
  payment_status?: 'unpaid' | 'pending_verification' | 'paid' | 'failed';
  concept_design_file?: string[];
  concept_canva_link?: string;
  concept_is_approved: boolean;
  client_approval?: 'yes' | 'no';
  client_change_request_notes?: string;
  client_change_request_files?: string[];
  construction_updates: Update[];
  percent_complete: number;
  handover_file?: string;
  completion_date?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
