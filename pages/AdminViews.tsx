
import React, { useState, useEffect } from 'react';
import { User, Project, Update, AvailabilityRecord, Proposal } from '../types';
import { db } from '../services/db';
import { Button, Input, StatusBadge, FileUpload, GlassCard, SectionTitle, Label } from '../components/UI';
import { generateEmailTemplate, generateProjectSummary } from '../services/ai';

// Helper component to render client name asynchronously
const ClientName: React.FC<{ project: Project }> = ({ project }) => {
  const [clientName, setClientName] = useState<string>('Loading...');
  
  useEffect(() => {
    const loadClient = async () => {
      try {
        const user = await db.getUser(project.client_id);
        setClientName(user?.name || 'Unknown');
      } catch (error) {
        console.error('Error loading client:', error);
        setClientName('Unknown');
      }
    };
    loadClient();
  }, [project.client_id]);
  
  return <span>{clientName}</span>;
};

export const AdminDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const isSuper = user.role === 'superadmin';
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [activeView, setActiveView] = useState<'projects' | 'availability' | 'staff' | 'approvals'>('projects');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const projs = await db.getProjects(undefined, user.role);
      setProjects(projs);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const totalActive = projects.filter(p => p.status !== 'Completed').length;
  const pendingApts = projects.filter(p => p.appointment?.status === 'pending').length;

  const handleEdit = async (project: Project) => {
    setEditingProject(project);
    const summary = await generateProjectSummary(project);
    setAiSummary(summary);
  };

  const closeModal = async () => {
    setEditingProject(null);
    await refreshData();
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-12 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
             <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                    {isSuper ? 'Command Console' : 'Project Management'}
                </p>
                <h1 className="text-4xl font-light text-zinc-900">
                    {isSuper ? `Hello, Anjola` : `Portal: ${user.name}`}
                </h1>
             </div>
             <div className="flex flex-wrap items-center gap-4 md:gap-8">
                 <nav className="flex gap-4 md:mr-8 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                    <button onClick={() => setActiveView('projects')} className={`text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${activeView === 'projects' ? 'border-amber-700 text-zinc-900' : 'border-transparent text-stone-400'}`}>Projects</button>
                    <button onClick={() => setActiveView('availability')} className={`text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${activeView === 'availability' ? 'border-amber-700 text-zinc-900' : 'border-transparent text-stone-400'}`}>Calendar</button>
                    {isSuper && (
                        <>
                            <button onClick={() => setActiveView('approvals')} className={`text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${activeView === 'approvals' ? 'border-amber-700 text-zinc-900' : 'border-transparent text-stone-400'}`}>Approvals</button>
                            <button onClick={() => setActiveView('staff')} className={`text-[10px] uppercase tracking-widest font-bold pb-2 border-b-2 transition-all ${activeView === 'staff' ? 'border-amber-700 text-zinc-900' : 'border-transparent text-stone-400'}`}>Staff</button>
                        </>
                    )}
                 </nav>
                 <div className="flex gap-3">
                    <Button variant="outline" className="text-[10px] uppercase tracking-widest hidden md:flex items-center gap-2" onClick={() => window.open('https://docs.google.com/spreadsheets/', '_blank')}>
                        <span className="text-emerald-600">📊</span> Master Ledger
                    </Button>
                    <Button variant="secondary" onClick={onLogout} className="text-[10px] uppercase tracking-widest">Logout</Button>
                 </div>
             </div>
        </header>

        {activeView === 'projects' && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <GlassCard className="flex items-center justify-between">
                        <div><p className="text-stone-500 text-[10px] uppercase tracking-widest">Active</p><p className="text-2xl font-light">{totalActive}</p></div>
                        <div className="text-2xl">⚡</div>
                    </GlassCard>
                    <GlassCard className={`flex items-center justify-between border-2 ${pendingApts > 0 ? 'border-amber-200 bg-amber-50/50 animate-pulse' : ''}`}>
                        <div><p className="text-stone-500 text-[10px] uppercase tracking-widest">Apt Pending</p><p className="text-2xl font-light">{pendingApts}</p></div>
                        <div className="text-2xl">📅</div>
                    </GlassCard>
                    <GlassCard className="flex items-center justify-between">
                        <div><p className="text-stone-500 text-[10px] uppercase tracking-widest">Project Revenue</p><p className="text-2xl font-light">₦1.2M</p></div>
                        <div className="text-2xl">💰</div>
                    </GlassCard>
                </div>

                <GlassCard className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-stone-50"><tr className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                <th className="px-8 py-4">Title</th><th className="px-8 py-4">Client</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Action</th>
                            </tr></thead>
                            <tbody className="divide-y divide-stone-100">
                                {projects.map(p => (
                                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-8 py-6 font-medium text-sm">
                                            {p.project_title}
                                            <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" title="Synced to Sheets"></span>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-stone-500">
                                          <ClientName project={p} />
                                        </td>
                                        <td className="px-8 py-6"><StatusBadge status={p.status} /></td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => handleEdit(p)} className="text-[10px] font-bold uppercase tracking-widest border-b border-zinc-900">Manage →</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </>
        )}

        {activeView === 'availability' && <AvailabilityManager />}
        {activeView === 'staff' && isSuper && <StaffManager refreshMain={refreshData} />}
        {activeView === 'approvals' && isSuper && <ApprovalQueue refreshMain={refreshData} />}

        {editingProject && (
            <ProjectEditor project={editingProject} aiSummary={aiSummary} onClose={closeModal} currentUser={user} />
        )}
      </div>
    </div>
  );
};

const StaffManager = ({ refreshMain }: { refreshMain: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [staff, setStaff] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStaff = async () => {
            try {
                const staffList = await db.getStaff();
                setStaff(staffList);
            } catch (error) {
                console.error('Error loading staff:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStaff();
    }, []);

    const handleCreate = async () => {
        if(!name || !email || !password) return alert("All fields required");
        try {
            await db.createWorker({ name, email, password });
            const updatedStaff = await db.getStaff();
            setStaff(updatedStaff);
            setName(''); setEmail(''); setPassword('');
            alert("Worker account created successfully.");
        } catch (error) {
            console.error('Error creating worker:', error);
            alert("Failed to create worker account. Please try again.");
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-12 animate-fade-in">
            <GlassCard>
                <SectionTitle>Onboard New Staff</SectionTitle>
                <div className="space-y-4">
                    <Input label="Staff Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input label="Temporary Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button onClick={handleCreate} className="w-full">Initialize Access</Button>
                </div>
            </GlassCard>
            <GlassCard>
                <SectionTitle>Active Workers</SectionTitle>
                <div className="space-y-4">
                    {staff.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl border border-stone-200">
                            <div><p className="font-bold text-sm">{s.name}</p><p className="text-[10px] uppercase text-stone-400">{s.role}</p></div>
                            <p className="text-[10px] text-zinc-900 font-mono bg-white px-2 py-1 rounded">{s.password}</p>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

const ApprovalQueue = ({ refreshMain }: { refreshMain: () => void }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const projs = await db.getProjects(undefined, 'superadmin');
                setProjects(projs);
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        };
        loadProjects();
    }, []);

    // Gathers all things needing Anjola's approval
    const pendingProposals = projects.filter(p => p.proposal?.status === 'pending_approval');
    const pendingConcepts = projects.filter(p => p.concept_design_file && !p.concept_is_approved);
    const pendingPayments = projects.filter(p => p.payment_status === 'pending_verification');
    const pendingUpdates: {p: Project, u: Update}[] = [];
    projects.forEach(p => p.construction_updates.forEach(u => { if(!u.is_approved) pendingUpdates.push({p, u}) }));

    const handleApproveProposal = async (id: string) => { 
        try {
            await db.approveProposal(id); 
            await refreshMain();
            const updated = await db.getProjects(undefined, 'superadmin');
            setProjects(updated);
        } catch (error) {
            console.error('Error approving proposal:', error);
            alert('Failed to approve proposal. Please try again.');
        }
    };
    const handleApproveConcept = async (id: string) => { 
        try {
            await db.approveConcept(id); 
            await refreshMain();
            const updated = await db.getProjects(undefined, 'superadmin');
            setProjects(updated);
        } catch (error) {
            console.error('Error approving concept:', error);
            alert('Failed to approve concept. Please try again.');
        }
    };
    const handleApproveUpdate = async (pid: string, uid: string) => { 
        try {
            await db.approveSiteUpdate(pid, uid); 
            await refreshMain();
            const updated = await db.getProjects(undefined, 'superadmin');
            setProjects(updated);
        } catch (error) {
            console.error('Error approving update:', error);
            alert('Failed to approve update. Please try again.');
        }
    };
    const handleApprovePayment = async (id: string) => { 
        try {
            await db.verifyPayment(id); 
            await refreshMain();
            const updated = await db.getProjects(undefined, 'superadmin');
            setProjects(updated);
        } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Failed to verify payment. Please try again.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <SectionTitle>Oversight Queue</SectionTitle>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pendingPayments.map(p => (
                    <GlassCard key={p.id} className="border-amber-300 bg-amber-50/10">
                        <Label>Incoming Payment</Label>
                        <h4 className="font-bold mb-2">{p.project_title}</h4>
                        <p className="text-sm text-stone-500 mb-4">Amount: ₦{p.proposal?.amount.toLocaleString()} (via Paystack)</p>
                        <Button onClick={() => handleApprovePayment(p.id)} variant="gold" className="w-full py-2 text-xs">Confirm Receipt</Button>
                    </GlassCard>
                ))}

                {pendingProposals.map(p => (
                    <GlassCard key={p.id} className="border-amber-200">
                        <Label>Pending Proposal</Label>
                        <h4 className="font-bold mb-2">{p.project_title}</h4>
                        <p className="text-sm text-stone-500 mb-4">Amount: ₦{p.proposal?.amount.toLocaleString()}</p>
                        <div className="flex gap-2">
                             <Button onClick={() => handleApproveProposal(p.id)} className="flex-1 py-2 text-xs">Approve & Send</Button>
                        </div>
                    </GlassCard>
                ))}

                {pendingConcepts.map(p => (
                    <GlassCard key={p.id} className="border-blue-200">
                        <Label>Pending Concept</Label>
                        <h4 className="font-bold mb-2">{p.project_title}</h4>
                        <p className="text-sm text-stone-500 mb-4">New designs uploaded by staff.</p>
                        <Button onClick={() => handleApproveConcept(p.id)} className="w-full py-2 text-xs">Publish to Client</Button>
                    </GlassCard>
                ))}

                {pendingUpdates.map(({p, u}) => (
                    <GlassCard key={u.id} className="border-emerald-200">
                        <Label>Site Update Review</Label>
                        <h4 className="font-bold mb-2">{p.project_title}</h4>
                        <p className="text-xs italic text-stone-500 line-clamp-2 mb-4">"{u.update_notes}"</p>
                        <Button onClick={() => handleApproveUpdate(p.id, u.id)} className="w-full py-2 text-xs">Authorize Publication</Button>
                    </GlassCard>
                ))}

                {pendingPayments.length === 0 && pendingProposals.length === 0 && pendingConcepts.length === 0 && pendingUpdates.length === 0 && (
                    <div className="col-span-full py-12 text-center text-stone-400 italic">No pending actions requiring oversight.</div>
                )}
            </div>
        </div>
    );
}

const ProjectEditor: React.FC<{ project: Project; aiSummary: string; onClose: () => void, currentUser: User }> = ({ project, aiSummary, onClose, currentUser }) => {
    const isSuper = currentUser.role === 'superadmin';
    const [amount, setAmount] = useState(project.proposal?.amount || 0);
    const [updateText, setUpdateText] = useState('');
    const [progress, setProgress] = useState(project.percent_complete);
    const [canvaLink, setCanvaLink] = useState(project.concept_canva_link || '');
    const [proposalFile, setProposalFile] = useState<string | null>(null);
    const [conceptFile, setConceptFile] = useState<string | null>(null);
    const [updateImages, setUpdateImages] = useState<string[]>([]);

    const handleAction = async (type: 'proposal' | 'concept' | 'update' | 'confirm_appointment' | 'verify_payment') => {
        try {
            if(type === 'proposal') {
                await db.sendProposal(project.id, amount, proposalFile || '', currentUser.id);
                alert(isSuper ? "Proposal sent to client." : "Proposal submitted to Anjola for approval.");
            } else if (type === 'concept') {
                await db.shareConcept(project.id, conceptFile ? [conceptFile] : [], canvaLink, currentUser.id);
                alert(isSuper ? "Concept published." : "Concept submitted for review.");
            } else if (type === 'update') {
                await db.addUpdate(project.id, {
                    id: Date.now().toString(),
                    project_id: project.id,
                    update_title: 'Construction Update',
                    update_notes: updateText,
                    progress_images: updateImages,
                    progress_percentage: progress,
                    created_by_id: currentUser.id,
                    created_at: new Date().toISOString()
                }, currentUser.id);
                alert(isSuper ? "Update published." : "Update sent to review queue.");
            } else if (type === 'confirm_appointment') {
                await db.confirmAppointment(project.id);
                alert("Consultation slot confirmed.");
            } else if (type === 'verify_payment') {
                await db.verifyPayment(project.id);
                alert("Payment verified. Project phase updated.");
            }
            onClose();
        } catch (error) {
            console.error('Error performing action:', error);
            alert('Failed to perform action. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-2xl w-full h-[90vh] overflow-y-auto p-8 relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-zinc-900">✕</button>
                
                <header className="mb-8 border-b pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-light">{project.project_title}</h2>
                            <p className="text-xs uppercase tracking-widest text-stone-400 mt-2">{isSuper ? 'Master Control' : 'Staff Access'}</p>
                        </div>
                        <StatusBadge status={project.status} />
                    </div>
                </header>

                <div className="space-y-12">
                    {/* AI Intelligence Panel */}
                    <div className="bg-zinc-900 p-6 rounded-2xl text-stone-100 shadow-xl border border-zinc-800">
                        <SectionTitle className="text-sm mb-4 text-stone-100 flex items-center gap-2">
                            <span className="text-amber-500">✦</span> AI Project Insight
                        </SectionTitle>
                        <p className="text-sm font-light leading-relaxed italic opacity-80">
                            {aiSummary || "Generating contextually aware project summary..."}
                        </p>
                    </div>

                    {/* Pending Verification Banner */}
                    {project.payment_status === 'pending_verification' && (
                        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <SectionTitle className="text-sm mb-1">Incoming Transaction</SectionTitle>
                                <p className="text-xs text-amber-800">Client has completed Paystack checkout. Please verify receipt in the bank before unlocking designs.</p>
                            </div>
                            <Button onClick={() => handleAction('verify_payment')} variant="gold" className="whitespace-nowrap py-2">Confirm Payment</Button>
                        </div>
                    )}

                    {/* Appointment Section */}
                    {project.appointment && (
                        <div className={`p-6 rounded-2xl border ${project.appointment.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                            <SectionTitle className="text-sm mb-4">Consultation Management</SectionTitle>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Requested Slot</p>
                                    <p className="text-lg font-medium text-zinc-900">{new Date(project.appointment.date).toLocaleDateString()} @ {project.appointment.time}</p>
                                </div>
                                <StatusBadge status={project.appointment.status === 'pending' ? 'Appointment Needed' : 'Consultation Done'} />
                            </div>
                            {project.appointment.status === 'pending' && (
                                <div className="flex gap-4">
                                    <Button onClick={() => handleAction('confirm_appointment')} className="flex-1 py-2">Confirm Slot</Button>
                                    <Button variant="outline" className="flex-1 py-2">Reschedule</Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Proposal Section */}
                    <div className={`bg-stone-50 p-6 rounded-2xl border ${project.proposal?.status === 'revision_requested' ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200'}`}>
                        <SectionTitle className="text-sm mb-4">Financial Proposal</SectionTitle>
                        
                        {project.proposal?.status === 'revision_requested' && (
                            <div className="mb-6 p-4 bg-amber-100/50 rounded-xl border border-amber-200">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1">Client Challenge Note</p>
                                <p className="text-sm italic text-amber-900 leading-relaxed">"{project.proposal.revision_notes}"</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input label="Amount (₦)" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                            <FileUpload label="Proposal PDF" onUpload={setProposalFile} />
                            <Button onClick={() => handleAction('proposal')} className="w-full">
                                {isSuper ? 'Authorize & Send' : 'Submit for Review'}
                            </Button>
                        </div>
                    </div>

                    {/* Concept Section */}
                    <div className={`bg-stone-50 p-6 rounded-2xl border border-stone-200 ${project.payment_status !== 'paid' ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                        <SectionTitle className="text-sm mb-4">Design Concepts</SectionTitle>
                        {project.payment_status !== 'paid' && <p className="text-[10px] text-amber-700 font-bold mb-4 uppercase tracking-widest">Locked: Awaiting Payment Verification</p>}
                        <div className="space-y-4">
                            <Input label="Canva Link" value={canvaLink} onChange={e => setCanvaLink(e.target.value)} />
                            <FileUpload label="Renders" onUpload={setConceptFile} />
                            <Button onClick={() => handleAction('concept')} className="w-full">
                                {isSuper ? 'Publish Presentation' : 'Request Oversight'}
                            </Button>
                        </div>
                    </div>

                    {/* Updates Section */}
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <SectionTitle className="text-sm mb-4">Site Tracking</SectionTitle>
                        <div className="space-y-4">
                            <Input label="Notes" value={updateText} onChange={e => setUpdateText(e.target.value)} />
                            <div className="flex items-center gap-4">
                                <Label className="mb-0">Progress: {progress}%</Label>
                                <input type="range" className="flex-1 accent-zinc-900" value={progress} onChange={e => setProgress(Number(e.target.value))} />
                            </div>
                            <Button onClick={() => handleAction('update')} className="w-full">
                                {isSuper ? 'Broadcast Update' : 'Queue for Review'}
                            </Button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

const AvailabilityManager: React.FC = () => {
    const [availability, setAvailability] = useState<AvailabilityRecord[]>(db.getAvailability());
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const standardSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    const handleSave = () => {
        if (!selectedDate) return;
        const newAvail = [...availability.filter(a => a.date !== selectedDate), { date: selectedDate, slots: selectedSlots }];
        setAvailability(newAvail);
        db.setAvailability(newAvail);
        alert("Schedule updated.");
    };

    return (
        <GlassCard className="max-w-xl mx-auto">
            <SectionTitle>Global Schedule Control</SectionTitle>
            <div className="space-y-6">
                <input type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)} className="w-full p-4 rounded-xl border" />
                {selectedDate && (
                    <div className="grid grid-cols-3 gap-2">
                        {standardSlots.map(s => (
                            <button key={s} onClick={() => setSelectedSlots(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`p-2 text-[10px] font-bold rounded-lg border ${selectedSlots.includes(s) ? 'bg-zinc-900 text-white' : 'bg-white'}`}>{s}</button>
                        ))}
                    </div>
                )}
                {selectedDate && <Button onClick={handleSave} className="w-full">Commit Changes</Button>}
            </div>
        </GlassCard>
    );
};
