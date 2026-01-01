
import React, { useState, useEffect } from 'react';
import { User, Project, Update, AvailabilityRecord } from '../types';
import { db } from '../services/db';
import { Button, Input, StatusBadge, ProgressBar, FileUpload, GlassCard, SectionTitle, Label } from '../components/UI';
import { syncProjectBriefToSheets } from '../services/sheets';

const getImgSrc = (src: string) => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return `https://placehold.co/800x600/e5e5e5/1c1917?text=${encodeURIComponent(src)}`;
};

// --- Paystack Simulation Modal ---

const PaystackModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSuccess: () => void;
    amount: number;
    email: string;
    projectTitle: string;
}> = ({ isOpen, onClose, onSuccess, amount, email, projectTitle }) => {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    useEffect(() => {
        if (step === 'processing') {
            const timer = setTimeout(() => setStep('success'), 3500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transition-all transform scale-100">
                {step === 'details' && (
                    <>
                        <div className="p-6 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#09A5DB] rounded-full flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">P</span>
                                </div>
                                <span className="text-sm font-bold text-stone-800 tracking-tight">paystack</span>
                            </div>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">✕</button>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Paying Atelier Anj</p>
                                <p className="text-3xl font-bold text-stone-900">₦{amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs pb-3 border-b border-stone-50">
                                    <span className="text-stone-400">Email</span>
                                    <span className="text-stone-800 font-medium">{email}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs pb-3 border-b border-stone-50">
                                    <span className="text-stone-400">Project</span>
                                    <span className="text-stone-800 font-medium truncate ml-4">{projectTitle}</span>
                                </div>
                            </div>
                            <div className="mt-10">
                                <button 
                                    onClick={() => setStep('processing')}
                                    className="w-full bg-[#09A5DB] hover:bg-[#078DBB] text-white py-4 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95"
                                >
                                    Pay with Card
                                </button>
                                <p className="text-[10px] text-center text-stone-400 mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
                                    <span className="text-[#09A5DB]">🔒</span> Secured by Paystack
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div className="p-12 flex flex-col items-center justify-center h-80">
                        <div className="w-12 h-12 border-4 border-[#09A5DB]/20 border-t-[#09A5DB] rounded-full animate-spin mb-6"></div>
                        <p className="text-stone-800 font-bold tracking-tight">Processing payment...</p>
                        <p className="text-xs text-stone-400 mt-2">Please do not refresh the page.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-emerald-600 text-4xl">✓</span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">Transaction Received</h3>
                        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
                            Your payment has been logged. Our finance team will verify the transaction within 24 hours.
                        </p>
                        <button 
                            onClick={onSuccess}
                            className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold text-sm"
                        >
                            Return to Portal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Views ---

const Sidebar: React.FC<{ 
    activeTab: string; 
    onTabChange: (tab: string) => void; 
    user: User; 
    onLogout: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}> = ({ activeTab, onTabChange, user, onLogout, isOpen, onClose }) => {
    const items = [
        { id: 'Overview', icon: '⊞' },
        { id: 'Appointments', icon: '📅' },
        { id: 'Proposal', icon: '📄' },
        { id: 'Payment', icon: '💳' },
        { id: 'Concept', icon: '🎨' },
        { id: 'Progress', icon: '🏗️' },
        { id: 'Handover', icon: '📦' },
    ];

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={onClose}></div>
            )}
            <div className={`fixed left-0 top-0 h-screen w-64 bg-zinc-900 text-stone-400 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-8">
                    <h1 className="text-white text-xl font-bold tracking-[0.2em] uppercase">Atelier Anj</h1>
                    <p className="text-xs uppercase tracking-widest mt-2 text-stone-600">Client Portal</p>
                </div>
                <nav className="mt-4 pb-4 overflow-y-auto flex-grow">
                    {items.map(item => (
                        <button key={item.id} onClick={() => { onTabChange(item.id); if (onClose) onClose(); }} className={`w-full text-left px-8 py-4 flex items-center gap-4 transition-all duration-300 border-l-2 ${activeTab === item.id ? 'border-amber-700 text-white bg-white/5' : 'border-transparent hover:text-white hover:bg-white/5'}`}>
                            <span className="text-lg opacity-80">{item.icon}</span>
                            <span className="text-sm uppercase tracking-wider font-medium">{item.id}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-8 border-t border-zinc-800 bg-zinc-950/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-xs">{user.name.charAt(0)}</div>
                        <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    </div>
                    <button onClick={onLogout} className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <span>←</span> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export const InitialFormPage: React.FC<{ user: User; onComplete: () => void; onLogout: () => void }> = ({ user, onComplete, onLogout }) => {
  const [form, setForm] = useState({ project_title: '', project_location: '', project_type: 'Residential', budget: 0, timeline: '', requirements: '', inspiration_images: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setIsSubmitting(true);
    const initialForm = { ...form, submitted_at: new Date().toISOString() };
    db.createProject(user.id, initialForm); 
    await syncProjectBriefToSheets(user, initialForm);
    setIsSubmitting(false);
    onComplete(); 
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 lg:px-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
            <div>
                <SectionTitle className="text-4xl mb-2">Project Brief</SectionTitle>
                <p className="text-stone-500 font-light italic">Defining your spatial requirements for our architects.</p>
            </div>
            <Button variant="outline" onClick={onLogout} className="text-xs">Sign Out</Button>
        </div>
        <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Input label="Project Title" value={form.project_title} onChange={e => setForm({...form, project_title: e.target.value})} required />
                <Input label="Location" value={form.project_location} onChange={e => setForm({...form, project_location: e.target.value})} required />
                <div className="grid md:grid-cols-2 gap-8">
                    <Input label="Budget Estimate (₦)" type="number" value={form.budget} onChange={e => setForm({...form, budget: Number(e.target.value)})} />
                    <Input label="Timeline" value={form.timeline} onChange={e => setForm({...form, timeline: e.target.value})} />
                </div>
                <Label>Requirements</Label>
                <textarea className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-800 h-40 focus:outline-none" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} required></textarea>
                <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="gold" className="px-12" disabled={isSubmitting}>
                        {isSubmitting ? 'Syncing Brief...' : 'Submit Brief'}
                    </Button>
                </div>
            </form>
        </GlassCard>
      </div>
    </div>
  );
};

export const AppointmentBooking: React.FC<{ user: User; onComplete: () => void; onCancel: () => void }> = ({ user, onComplete, onCancel }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const projects = db.getProjects(user.id, user.role);
    const project = projects[projects.length - 1];
    
    const handleBooking = (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (project) { 
        db.bookAppointment(project.id, date, time, user.id); 
        onComplete(); 
      } 
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
            <GlassCard className="max-w-md w-full animate-fade-in relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-stone-400">✕</button>
                <SectionTitle className="text-center">Consultation</SectionTitle>
                <p className="text-center text-stone-500 text-xs mb-8 uppercase tracking-widest">Select a convenient time for your initial brief</p>
                <form onSubmit={handleBooking} className="space-y-6">
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 border rounded-xl" />
                    {date && (
                        <div className="grid grid-cols-3 gap-2">
                            {db.isDateAvailable(date).slots.map(s => (
                                <button key={s} type="button" onClick={() => setTime(s)} className={`p-2 text-[10px] font-bold border rounded-lg transition-all ${time === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white hover:bg-stone-50'}`}>{s}</button>
                            ))}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={!date || !time}>Confirm Appointment</Button>
                </form>
            </GlassCard>
        </div>
    );
};

export const ClientDashboard: React.FC<{ user: User; onLogout: () => void; navigateTo: (page: string) => void }> = ({ user, onLogout, navigateTo }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [projects, setProjects] = useState<Project[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Revision States
    const [isRevising, setIsRevising] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');

    // Paystack states
    const [isPaystackOpen, setIsPaystackOpen] = useState(false);

    useEffect(() => { 
        const projs = db.getProjects(user.id, user.role);
        setProjects(projs); 
    }, [user.id, user.role, activeTab]);

    const project = projects[0];

    if (!project) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-6">🏛️</div>
                <h2 className="text-2xl font-light mb-4">No Active Projects</h2>
                <p className="text-stone-500 mb-8 max-w-xs">It looks like you haven't defined a project brief yet. Let's get started.</p>
                <div className="flex gap-4">
                    <Button onClick={() => navigateTo('initial-form')}>Start New Project</Button>
                    <Button variant="secondary" onClick={onLogout}>Sign Out</Button>
                </div>
            </div>
        );
    }

    const approvedUpdates = project.construction_updates.filter(u => u.is_approved);

    const handleRevisionSubmit = () => {
        if (!revisionNotes.trim()) return alert("Please provide revision notes.");
        db.requestProposalRevision(project.id, revisionNotes);
        setIsRevising(false);
        setRevisionNotes('');
        setProjects(db.getProjects(user.id, user.role));
        alert("Revision requested.");
    };

    const handlePaymentSuccess = () => {
        setIsPaystackOpen(false);
        // Changed from verifyPayment to makePayment to ensure admin must confirm it
        db.makePayment(project.id, project.proposal?.amount || 0);
        setProjects(db.getProjects(user.id, user.role));
        setActiveTab('Payment');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {(project.status === 'Appointment Needed' || (project.proposal && project.status === 'Proposal Sent') || (project.concept_design_file && project.concept_is_approved && project.client_approval !== 'yes')) && (
                            <div className="space-y-4">
                                <SectionTitle className="text-xs uppercase tracking-[0.3em] font-bold text-amber-700 mb-0">Action Required</SectionTitle>
                                {project.status === 'Appointment Needed' && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">📅</span>
                                            <div>
                                                <p className="font-bold text-amber-900 text-sm">Consultation Required</p>
                                                <p className="text-xs text-amber-700/70">Please schedule your design brief.</p>
                                            </div>
                                        </div>
                                        <Button variant="gold" className="text-xs py-2 px-6" onClick={() => setActiveTab('Appointments')}>Book Now</Button>
                                    </div>
                                )}
                                {project.status === 'Proposal Sent' && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">📄</span>
                                            <div>
                                                <p className="font-bold text-amber-900 text-sm">Proposal Ready</p>
                                                <p className="text-xs text-amber-700/70">A project estimate has been published.</p>
                                            </div>
                                        </div>
                                        <Button variant="gold" className="text-xs py-2 px-6" onClick={() => setActiveTab('Proposal')}>Review Proposal</Button>
                                    </div>
                                )}
                                {project.status === 'Concept Shared' && project.client_approval !== 'yes' && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">🎨</span>
                                            <div>
                                                <p className="font-bold text-amber-900 text-sm">Design Approval Needed</p>
                                                <p className="text-xs text-amber-700/70">The interactive design concept is ready.</p>
                                            </div>
                                        </div>
                                        <Button variant="gold" className="text-xs py-2 px-6" onClick={() => setActiveTab('Concept')}>Review Design</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-10 shadow-2xl">
                             <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">📐</div>
                             <h2 className="text-4xl font-light mb-2 relative z-10">{project.project_title}</h2>
                             <div className="relative z-10 flex items-center gap-3">
                                <StatusBadge status={project.status} />
                                {project.payment_status === 'paid' && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">✓ Fully Funded</span>}
                             </div>
                             <div className="mt-8 relative z-10">
                                <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">Completion: {project.percent_complete}%</p>
                                <ProgressBar percentage={project.percent_complete} />
                             </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <GlassCard>
                                <SectionTitle className="text-lg">Project Scope</SectionTitle>
                                <p className="text-sm text-stone-500 font-light leading-loose">{project.initial_form?.requirements}</p>
                            </GlassCard>
                            <GlassCard>
                                <SectionTitle className="text-lg">Key Information</SectionTitle>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-stone-100 pb-2">
                                        <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Status</span>
                                        <span className="text-zinc-900 font-medium">{project.status}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-100 pb-2">
                                        <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Location</span>
                                        <span className="text-zinc-900">{project.initial_form?.project_location}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-100 pb-2">
                                        <span className="text-stone-400 uppercase tracking-widest text-[10px] font-bold">Budget (Estimate)</span>
                                        <span className="text-zinc-900">₦{project.initial_form?.budget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                );
            case 'Appointments':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Consultation Sessions</SectionTitle>
                        {project.appointment ? (
                            <GlassCard className="max-w-xl">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex flex-col items-center justify-center border border-stone-200">
                                        <span className="text-xs font-bold text-amber-700">{new Date(project.appointment.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-light">{new Date(project.appointment.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-zinc-900 uppercase tracking-wider">Initial Design Brief</h4>
                                        <p className="text-stone-500 text-sm mt-1">{project.appointment.time} • Local Time</p>
                                    </div>
                                    <StatusBadge status={project.appointment.status === 'pending' ? 'Appointment Needed' : 'Consultation Done'} />
                                </div>
                            </GlassCard>
                        ) : (
                            <div className="text-center py-20 bg-stone-100 rounded-3xl border border-dashed border-stone-300">
                                <p className="text-stone-500 italic mb-6">No consultation scheduled yet.</p>
                                <Button onClick={() => navigateTo('booking')} variant="primary">Book Appointment</Button>
                            </div>
                        )}
                    </div>
                );
            case 'Proposal':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Financial Proposals</SectionTitle>
                        {project.proposal && (project.proposal.status === 'sent' || project.proposal.status === 'revision_requested') ? (
                            <div className="space-y-6">
                                <GlassCard className="flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="w-full">
                                        <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold mb-2">Total Project Fee</p>
                                        <p className="text-4xl font-light text-zinc-900">₦{project.proposal.amount.toLocaleString()}</p>
                                        <div className="flex gap-2 mt-4">
                                            <span className="text-[10px] bg-stone-100 text-stone-500 px-3 py-1 rounded-full uppercase font-bold tracking-widest">VAT Inclusive</span>
                                            {project.proposal.status === 'revision_requested' && (
                                                <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Revision Requested</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        {project.status === 'Proposal Sent' && !isRevising && (
                                            <>
                                                <Button variant="gold" className="whitespace-nowrap flex-1 md:flex-none" onClick={() => { db.updateProject(project.id, { status: 'Payment Pending' }); setActiveTab('Payment'); }}>Accept & Proceed</Button>
                                                <Button variant="outline" className="whitespace-nowrap flex-1 md:flex-none" onClick={() => setIsRevising(true)}>Challenge Proposal</Button>
                                            </>
                                        )}
                                        <Button variant="outline" className="whitespace-nowrap flex-1 md:flex-none">Download PDF</Button>
                                    </div>
                                </GlassCard>

                                {isRevising && (
                                    <GlassCard className="animate-fade-in-up border-amber-200">
                                        <SectionTitle className="text-lg">Reason for Revision</SectionTitle>
                                        <textarea className="w-full bg-white border border-stone-200 p-4 rounded-xl text-stone-800 h-32 focus:outline-none focus:border-amber-700" placeholder="Notes..." value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)}></textarea>
                                        <div className="mt-6 flex justify-end gap-4">
                                            <Button variant="secondary" onClick={() => setIsRevising(false)}>Cancel</Button>
                                            <Button variant="gold" onClick={handleRevisionSubmit}>Submit Challenge</Button>
                                        </div>
                                    </GlassCard>
                                )}

                                {project.proposal.status === 'revision_requested' && (
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-sm text-amber-700 italic">
                                        "{project.proposal.revision_notes}"
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-stone-400 italic bg-stone-50 border border-stone-200 rounded-3xl">
                                Preparing your final estimate...
                            </div>
                        )}
                    </div>
                );
            case 'Payment':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Payment Portal</SectionTitle>
                        {project.status === 'Payment Pending' || project.payment_status === 'pending_verification' || project.payment_status === 'paid' ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                <GlassCard className="border-amber-100 bg-amber-50/10">
                                    <Label>Total Due</Label>
                                    <p className="text-3xl font-light mb-8">₦{project.proposal?.amount.toLocaleString()}</p>
                                    {project.payment_status === 'paid' ? (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-center font-bold uppercase tracking-widest text-xs">
                                            Payment Successful ✓
                                        </div>
                                    ) : project.payment_status === 'pending_verification' ? (
                                        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-amber-800">Verification in Progress</p>
                                            </div>
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                Our accounts team is currently verifying your Paystack transaction. Access to concepts will unlock shortly.
                                            </p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setIsPaystackOpen(true)}
                                            className="w-full bg-[#09A5DB] hover:bg-[#078DBB] text-white py-4 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                                <span className="text-[#09A5DB] text-[8px] font-bold">P</span>
                                            </div>
                                            Pay with Paystack
                                        </button>
                                    )}
                                </GlassCard>
                                <GlassCard>
                                    <SectionTitle className="text-sm">Escrow Details</SectionTitle>
                                    <p className="text-xs text-stone-500 leading-loose">
                                        Your payment is processed via Paystack. Funds are held in a secure architectural escrow until the Concept Design phase is approved.
                                    </p>
                                </GlassCard>
                            </div>
                        ) : (
                            <p className="text-stone-400 italic py-12 text-center border rounded-3xl border-dashed">Awaiting proposal acceptance.</p>
                        )}
                    </div>
                );
            case 'Concept':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Design Concepts</SectionTitle>
                        {project.concept_is_approved && project.concept_canva_link ? (
                            <div className="space-y-8">
                                <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative">
                                    <iframe src={project.concept_canva_link} className="w-full h-full" title="Concept"></iframe>
                                </div>
                                <div className="flex gap-4">
                                    {project.client_approval === 'yes' ? (
                                        <div className="w-full bg-emerald-50 text-emerald-700 p-6 rounded-3xl text-center font-bold uppercase tracking-[0.2em]">Design Approved ✓</div>
                                    ) : (
                                        <>
                                            <Button onClick={() => { db.approveClientConcept(project.id); setProjects(db.getProjects(user.id, user.role)); }} className="flex-1">Authorize Vision</Button>
                                            <Button variant="outline" className="flex-1">Request Changes</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-32 text-center text-stone-400 italic bg-stone-50 border border-stone-200 rounded-3xl">
                                {project.payment_status === 'paid' ? 'Crafting your 3D visualizations...' : 'Unlock design phase by completing payment.'}
                            </div>
                        )}
                    </div>
                );
            case 'Progress':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Site Progress: {project.percent_complete}%</SectionTitle>
                        <ProgressBar percentage={project.percent_complete} />
                        {approvedUpdates.length > 0 ? (
                            <div className="space-y-6">
                                {approvedUpdates.map(u => (
                                    <GlassCard key={u.id}>
                                        <h4 className="font-bold text-zinc-900 uppercase tracking-wider">{u.update_title}</h4>
                                        <p className="text-stone-600 text-sm mt-4">{u.update_notes}</p>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-stone-400 italic border rounded-3xl">Mobilizing site teams...</div>
                        )}
                    </div>
                );
            case 'Handover':
                return (
                    <div className="animate-fade-in space-y-8">
                        <SectionTitle>Project Handover</SectionTitle>
                        {project.status === 'Completed' ? (
                            <GlassCard className="text-center py-12">
                                <div className="text-5xl mb-6">🏆</div>
                                <h3 className="text-2xl font-light mb-10">Welcome Home</h3>
                                <Button variant="gold" className="px-10">Download Assets</Button>
                            </GlassCard>
                        ) : (
                            <div className="py-32 text-center text-stone-400 italic bg-stone-50 border border-stone-200 rounded-3xl">Initiating handover protocols at 100% completion.</div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-stone-50">
             <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
             <main className="flex-1 md:ml-64 p-6 md:p-12 pb-24">
                 <div className="md:hidden flex justify-between items-center mb-12">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">☰</button>
                    <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-900">Atelier Anj</h1>
                 </div>
                 <div className="max-w-5xl mx-auto">
                    {renderContent()}
                 </div>
             </main>
             <PaystackModal 
                isOpen={isPaystackOpen} 
                onClose={() => setIsPaystackOpen(false)} 
                onSuccess={handlePaymentSuccess} 
                amount={project.proposal?.amount || 0}
                email={user.email}
                projectTitle={project.project_title}
             />
        </div>
    );
}
