
import React, { useState, useEffect } from 'react';
import { Button, Input, GlassCard, Label, SectionTitle } from '../components/UI';
import { db } from '../services/db';
import { User } from '../types';
import { generatePasswordResetEmail } from '../services/ai';
import { syncClientToSheets } from '../services/sheets';

interface Props {
  onLogin: (user: User) => void;
  navigateTo: (page: string) => void;
  resetEmailContext?: string;
  setResetEmailContext?: (email: string) => void;
}

// --- Sub-components for Branding ---

const Portfolio = () => {
    const projects = [
        { title: "The Obsidian House", category: "Residential", location: "Lagos", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" },
        { title: "Ethereal Gardens", category: "Landscape", location: "Abuja", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" },
        { title: "Azure Horizon Mall", category: "Commercial", location: "Eko Atlantic", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" },
        { title: "Monolith Pavilion", category: "Institutional", location: "Ibadan", image: "https://images.unsplash.com/photo-1487958449643-ba05df07a332?q=80&w=2070&auto=format&fit=crop" },
        { title: "The Terraced Villa", category: "Residential", location: "Enugu", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop" },
        { title: "Civic Spine Center", category: "Urban Design", location: "Port Harcourt", image: "https://images.unsplash.com/photo-1449156003053-930cce5b1fd3?q=80&w=2070&auto=format&fit=crop" }
    ];

    return (
        <section className="py-24 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                    <span className="text-amber-700 text-xs font-bold tracking-[0.4em] uppercase block mb-4">The Archive</span>
                    <h2 className="text-5xl font-thin text-zinc-900 tracking-tight">Selected Works</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {projects.map((proj, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="overflow-hidden aspect-[4/5] bg-stone-200 mb-6">
                                <img 
                                    src={proj.image} 
                                    alt={proj.title} 
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" 
                                />
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-medium text-zinc-900 group-hover:text-amber-700 transition-colors uppercase tracking-wider">{proj.title}</h4>
                                    <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">{proj.location} • {proj.category}</p>
                                </div>
                                <span className="text-stone-300 group-hover:text-zinc-900 transition-colors">↗</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const About = () => {
    return (
        <div className="animate-fade-in">
            {/* Philosophy Section */}
            <section className="py-32 bg-zinc-900 text-stone-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-700/10 -skew-x-12 translate-x-20"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase block mb-8">The Studio</span>
                    <h2 className="text-4xl md:text-6xl font-thin leading-[1.1] mb-12 tracking-tight">
                        Architecture as <span className="italic font-normal">Functional Art</span>. <br/>
                        Building contexts, not just structures.
                    </h2>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <p className="text-stone-400 font-light leading-loose text-lg">
                            Founded in 2012, Atelier Anj has emerged as a beacon of minimalist excellence in the West African architectural landscape. We believe that a building should be a dialogue between the Earth and the Sky—a precise intervention that respects local heritage while embracing global modernity.
                        </p>
                        <p className="text-stone-400 font-light leading-loose text-lg">
                            Our team of architects, designers, and urban planners works with a singular focus: clarity. By stripping away the superfluous, we reveal the soul of the space, ensuring that every line serves a purpose and every shadow tells a story.
                        </p>
                    </div>
                </div>
            </section>

            {/* Principles Section */}
            <section className="py-32 bg-stone-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: "Precision", desc: "Every millimeter is deliberate. We utilize advanced digital modeling to ensure structural integrity and aesthetic perfection." },
                            { title: "Sustainability", desc: "Our designs leverage passive cooling and natural light to minimize environmental footprint without compromising luxury." },
                            { title: "Legacy", desc: "We build for generations. Material selection and structural longevity are at the core of our technical specifications." }
                        ].map((item, i) => (
                            <div key={i} className="border-l border-stone-200 pl-8">
                                <h4 className="text-amber-700 font-bold uppercase tracking-widest text-xs mb-4">{item.title}</h4>
                                <p className="text-stone-600 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder Section */}
            <section className="py-24 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 aspect-[3/4] bg-stone-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale" alt="Founder" />
                </div>
                <div className="md:w-1/2">
                    <span className="text-amber-700 text-[10px] font-bold tracking-[0.5em] uppercase block mb-4">Leadership</span>
                    <h3 className="text-4xl font-light text-zinc-900 mb-6 tracking-tight">Sarah Anjolaoluwa</h3>
                    <p className="text-xs uppercase tracking-widest text-stone-500 mb-8 font-semibold">Principal Architect & Founder</p>
                    <p className="text-stone-600 font-light leading-loose mb-10 text-lg italic">
                        "Design is not about what we see, but how we experience time and space. My vision for this atelier was to create a sanctuary of thought where we could challenge the norms of modern urbanism."
                    </p>
                    <div className="h-0.5 w-12 bg-amber-700"></div>
                </div>
            </section>
        </div>
    );
};

// --- Main Home View ---

export const Home: React.FC<{ navigateTo: (page: string) => void }> = ({ navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'works' | 'studio'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col font-light bg-stone-50">
      {/* Premium Header */}
      <header className="fixed top-0 w-full z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <button onClick={() => setActiveTab('home')} className="text-xl tracking-[0.25em] font-bold text-zinc-900 uppercase">Atelier Anj</button>
          
          <nav className="hidden md:flex space-x-10 items-center">
            {['works', 'studio'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all ${activeTab === tab ? 'text-amber-700 border-b-2 border-amber-700' : 'text-stone-400 hover:text-zinc-900'}`}
                >
                    {tab}
                </button>
            ))}
            <div className="h-4 w-px bg-stone-300 mx-2"></div>
            <button onClick={() => navigateTo('login')} className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-900 hover:text-amber-700 transition-colors">Client Login</button>
            <Button variant="primary" onClick={() => navigateTo('signup')} className="text-[10px] uppercase tracking-widest px-6 py-2">Start Project</Button>
          </nav>

          {/* Mobile Menu Icon */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-zinc-900 p-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden animate-fade-in">
            <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-lg" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute top-0 right-0 w-4/5 h-full bg-zinc-950 shadow-2xl p-12 flex flex-col text-stone-400">
                <button onClick={() => setIsMobileMenuOpen(false)} className="self-end mb-12 text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="flex flex-col gap-8">
                    <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className={`text-2xl font-thin tracking-[0.2em] text-left uppercase ${activeTab === 'home' ? 'text-amber-500' : 'text-stone-500'}`}>Home</button>
                    <button onClick={() => { setActiveTab('works'); setIsMobileMenuOpen(false); }} className={`text-2xl font-thin tracking-[0.2em] text-left uppercase ${activeTab === 'works' ? 'text-amber-500' : 'text-stone-500'}`}>Works</button>
                    <button onClick={() => { setActiveTab('studio'); setIsMobileMenuOpen(false); }} className={`text-2xl font-thin tracking-[0.2em] text-left uppercase ${activeTab === 'studio' ? 'text-amber-500' : 'text-stone-500'}`}>Studio</button>
                    <div className="h-px bg-zinc-800 my-4 w-12"></div>
                    <button onClick={() => { navigateTo('login'); setIsMobileMenuOpen(false); }} className="text-xl font-medium tracking-widest text-left uppercase text-white">Client Login</button>
                    <button onClick={() => { navigateTo('signup'); setIsMobileMenuOpen(false); }} className="text-xl font-medium tracking-widest text-left uppercase text-amber-500">Start Project</button>
                </div>
                <div className="mt-auto pt-12">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-700">Atelier Anj &copy; 2024</p>
                </div>
            </div>
        </div>
      )}
      
      <main className="flex-grow pt-20">
        {activeTab === 'home' && (
            <>
                <section className="relative h-[92vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src="https://images.unsplash.com/photo-1486718448742-163732cd1544?q=80&w=2574&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[0.8]" alt="Architecture" />
                        <div className="absolute inset-0 bg-zinc-900/40"></div>
                    </div>
                    <div className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up">
                        <span className="text-amber-400 text-xs font-bold tracking-[0.6em] uppercase block mb-6 drop-shadow-lg">Excellence in Form</span>
                        <h2 className="text-6xl md:text-8xl font-thin text-white mb-8 tracking-tighter leading-tight">
                        DESIGN <br/> <span className="font-bold italic">REDEFINED</span>
                        </h2>
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-12">
                            <Button variant="gold" className="text-xs uppercase tracking-widest px-12 py-4" onClick={() => setActiveTab('works')}>View Portfolio</Button>
                            <button onClick={() => setActiveTab('studio')} className="text-white text-xs uppercase tracking-widest font-bold border-b border-white hover:text-amber-400 hover:border-amber-400 transition-all pb-2">Our Philosophy</button>
                        </div>
                    </div>
                </section>

                {/* The Journey (Steps) Section */}
                <section className="py-32 bg-zinc-900 text-white border-y border-zinc-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
                            <div className="max-w-2xl">
                                <span className="text-amber-500 text-xs font-bold tracking-[0.4em] uppercase block mb-4">The Process</span>
                                <h2 className="text-5xl font-thin tracking-tight leading-tight">Your vision, <br/> meticulously executed.</h2>
                            </div>
                            <p className="text-stone-400 font-light max-w-xs text-sm leading-loose">
                                Our bespoke client platform ensures complete transparency from the first sketch to the final brick.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
                            {[
                                { step: "01", title: "The Brief", desc: "Define your aesthetic and functional constraints." },
                                { step: "02", title: "The Vision", desc: "Direct consultation with our principal architects." },
                                { step: "03", title: "The Blueprint", desc: "Transparent proposals and digital contracts." },
                                { step: "04", title: "The Craft", desc: "Interactive design concepts and 3D rendering." },
                                { step: "05", title: "The Realization", desc: "Live site updates and progress tracking." },
                                { step: "06", title: "The Legacy", desc: "Seamless handover of all certifications." }
                            ].map((item, i) => (
                                <div key={i} className="group hover:-translate-y-2 transition-transform duration-500">
                                    <span className="text-amber-500 text-3xl font-thin block mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{item.step}</span>
                                    <h4 className="text-lg font-medium mb-3 uppercase tracking-wider">{item.title}</h4>
                                    <p className="text-stone-500 text-xs font-light leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Project Teaser */}
                <section className="py-32 bg-stone-100">
                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-amber-700 text-xs font-bold tracking-[0.3em] uppercase block mb-6">Current Focus</span>
                            <h3 className="text-5xl font-thin text-zinc-900 mb-8 tracking-tight">The Brutalist <br/> <span className="font-bold italic">Eco-Pavilion</span></h3>
                            <p className="text-stone-500 font-light leading-loose text-lg mb-10">
                                A study in concrete, light, and greenery. Located in the heart of the capital, this project challenges the boundary between indoor sanctuary and outdoor wilderness.
                            </p>
                            <Button variant="outline" onClick={() => setActiveTab('works')}>Explore The Works</Button>
                        </div>
                        <div className="relative group overflow-hidden shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1518005020251-58296b8f51f0?q=80&w=2030&auto=format&fit=crop" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                    </div>
                </section>
            </>
        )}

        {activeTab === 'works' && <Portfolio />}
        {activeTab === 'studio' && <About />}
      </main>

      <footer className="bg-zinc-900 py-24 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-20">
                <div className="col-span-2">
                    <h3 className="text-white text-2xl font-bold tracking-[0.3em] uppercase mb-8">Atelier Anj</h3>
                    <p className="text-stone-500 font-light leading-loose max-w-sm">
                        Sculpting spaces that redefine the human experience. Join us in the pursuit of architectural purity.
                    </p>
                </div>
                <div>
                    <h4 className="text-stone-200 text-xs font-bold uppercase tracking-widest mb-6">Navigation</h4>
                    <nav className="flex flex-col space-y-4">
                        <button onClick={() => setActiveTab('home')} className="text-stone-500 text-xs uppercase tracking-widest hover:text-white text-left">Home</button>
                        <button onClick={() => setActiveTab('works')} className="text-stone-500 text-xs uppercase tracking-widest hover:text-white text-left">Portfolio</button>
                        <button onClick={() => setActiveTab('studio')} className="text-stone-500 text-xs uppercase tracking-widest hover:text-white text-left">Studio</button>
                    </nav>
                </div>
                <div>
                    <h4 className="text-stone-200 text-xs font-bold uppercase tracking-widest mb-6">Inquiries</h4>
                    <p className="text-stone-500 text-xs leading-relaxed uppercase tracking-wider">
                        Office 402, Victoria Plaza<br/>
                        Lagos, Nigeria<br/>
                        concierge@atelieranj.com
                    </p>
                </div>
            </div>
            <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-[10px] text-stone-600 uppercase tracking-[0.3em] font-bold">
                <p>&copy; 2024 Atelier Anj. All Rights Reserved.</p>
                <div className="flex space-x-8">
                    <span className="hover:text-amber-500 cursor-pointer transition-colors">Instagram</span>
                    <span className="hover:text-amber-500 cursor-pointer transition-colors">LinkedIn</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export const Login: React.FC<Props> = ({ onLogin, navigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const user = await db.login(email.trim(), password, role);
      if (user) {
        onLogin(user);
      } else {
        alert(`Authentication failed. Please check your email, password, and ensure you selected the correct role (${role}).`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  const fillAndLogin = async (e: string, p: string, r: string) => {
      setEmail(e);
      setPassword(p);
      setRole(r);
      try {
        const user = await db.login(e, p, r);
        if (user) onLogin(user);
      } catch (error) {
        console.error('Login error:', error);
      }
  }

  return (
    <div className="min-h-screen flex bg-stone-50">
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-zinc-900/40"></div>
            <div className="absolute bottom-12 left-12 text-white">
                <h2 className="text-4xl font-bold tracking-tight mb-2">ATELIER ANJ</h2>
                <p className="text-sm tracking-widest opacity-80 uppercase">Client Portal v2.0</p>
            </div>
            <button onClick={() => navigateTo('home')} className="absolute top-12 left-12 text-white/70 hover:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                ← Back to Home
            </button>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
            <button onClick={() => navigateTo('home')} className="lg:hidden absolute top-8 left-8 text-stone-500 hover:text-zinc-900 text-xs uppercase tracking-widest">
                ← Back
            </button>
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-light text-zinc-900">Welcome Back</h2>
                    <p className="text-stone-500 mt-2 font-light">Enter your credentials to access your project.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Password</Label>
                        <button type="button" onClick={() => navigateTo('forgot-password')} className="text-[10px] text-amber-700 font-bold uppercase tracking-wider hover:underline">Forgot Password?</button>
                      </div>
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-white/50 border-b border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:border-zinc-800 focus:bg-white transition-all duration-300 rounded-t-lg"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                    </div>
                    <div className="mb-6">
                        <Label>Select Role</Label>
                        <select 
                            className="w-full bg-white/50 border-b border-stone-300 px-4 py-3 text-stone-800 focus:outline-none focus:border-zinc-800 rounded-t-lg"
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="client">Client</option>
                            <option value="admin">Admin / Staff</option>
                        </select>
                    </div>
                    <Button type="submit" variant="primary" className="w-full">Sign In</Button>
                </form>
                <div className="mt-12 pt-8 border-t border-stone-200">
                    <Label className="text-center block mb-4">Demo Access (One-Click Sign In)</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => fillAndLogin('client@example.com', 'password123', 'client')} className="text-xs border border-amber-200 bg-amber-50/30 p-4 rounded-xl hover:bg-amber-100 text-left transition-colors group">
                            <span className="font-bold block text-zinc-900 group-hover:text-amber-700">Client Demo</span>
                            <span className="text-stone-500 text-[10px] uppercase tracking-tighter">client@example.com</span>
                        </button>
                        <button onClick={() => fillAndLogin('anjola@atelieranj.com', 'password123', 'admin')} className="text-xs border p-4 rounded-xl hover:bg-stone-100 text-left transition-colors">
                            <span className="font-bold block text-zinc-900">Admin Demo</span>
                            <span className="text-stone-500 text-[10px] uppercase tracking-tighter">anjola@atelieranj.com</span>
                        </button>
                    </div>
                </div>
                 <p className="mt-8 text-center text-sm text-stone-500">
                    New client? <button onClick={() => navigateTo('signup')} className="text-amber-700 font-medium hover:underline">Start a Project</button>
                </p>
            </div>
        </div>
    </div>
  );
};

export const ForgotPassword: React.FC<Props> = ({ navigateTo, setResetEmailContext }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailBody, setEmailBody] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await db.getUserByEmail(email);
      if (!user) {
        alert("No account found with that email address.");
        return;
      }

      setIsLoading(true);
      const body = await generatePasswordResetEmail(email);
      setEmailBody(body);
      setIsLoading(false);
      
      if (setResetEmailContext) {
        setResetEmailContext(email);
      }
    } catch (error) {
      console.error('Error requesting reset:', error);
      alert('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 relative">
      <div className="absolute top-0 right-0 w-2/3 h-full bg-stone-100 -skew-x-12 transform translate-x-1/3"></div>
      
      <button onClick={() => navigateTo('login')} className="absolute top-8 left-8 text-stone-500 hover:text-zinc-900 text-xs uppercase tracking-widest z-20">
        ← Back to Login
      </button>

      {emailBody ? (
        <GlassCard className="max-w-xl w-full z-10 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-700"></div>
          <div className="mb-6 flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Digital Simulation: Inbox</span>
            <span className="text-stone-400 text-[10px] uppercase">Just Now</span>
          </div>
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8">
            <p className="text-stone-400 text-xs mb-4">From: <span className="text-stone-900 font-medium">Atelier Anj Concierge</span></p>
            <div className="text-stone-800 font-light leading-relaxed whitespace-pre-wrap text-sm italic border-l-2 border-stone-200 pl-4">
              {emailBody.replace('[Reset Link]', '')}
            </div>
            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
               <Button variant="gold" className="text-xs px-8" onClick={() => navigateTo('reset-password')}>Reset Password</Button>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 text-center uppercase tracking-wider">Note: This is a simulation of the reset email you would receive.</p>
        </GlassCard>
      ) : (
        <GlassCard className="max-w-md w-full z-10 mx-4">
          <div className="text-center mb-8">
            <SectionTitle className="mb-2">Reset Access</SectionTitle>
            <p className="text-stone-500 font-light text-sm">Enter your registered email to receive a secure recovery link.</p>
          </div>
          <form onSubmit={handleRequestReset} className="space-y-6">
            <Input label="Email Address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Request Recovery Link'}
            </Button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

export const ResetPassword: React.FC<Props> = ({ navigateTo, resetEmailContext }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailContext) {
      alert("Session expired. Please request a new reset link.");
      navigateTo('forgot-password');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await db.updateUserPassword(resetEmailContext, newPassword);
      alert("Your password has been updated successfully.");
      navigateTo('login');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 relative">
       <div className="absolute top-0 right-0 w-2/3 h-full bg-stone-100 -skew-x-12 transform translate-x-1/3"></div>
       <GlassCard className="max-w-md w-full z-10">
          <div className="text-center mb-8">
            <SectionTitle className="mb-2">New Password</SectionTitle>
            <p className="text-stone-500 font-light text-sm">Create a strong password to secure your architectural projects.</p>
          </div>
          <form onSubmit={handleReset} className="space-y-6">
            <Input label="New Password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Input label="Confirm Password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <Button type="submit" variant="primary" className="w-full">Update Password</Button>
          </form>
       </GlassCard>
    </div>
  );
};

export const Signup: React.FC<Props> = ({ onLogin, navigateTo }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSyncing(true);
        try {
            const user = await db.signup({
                name: formData.name,
                email: formData.email.trim(),
                phone: formData.phone,
                password: formData.password,
                role: 'client'
            });
            
            // Sync to Google Sheets for record keeping
            await syncClientToSheets(user);
            
            // onLogin handles smart navigation in App.tsx
            onLogin(user);
        } catch (err: any) {
            alert(err.message || 'Signup failed.');
        } finally {
            setIsSyncing(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2/3 h-full bg-stone-100 -skew-x-12 transform translate-x-1/3"></div>
             <button onClick={() => navigateTo('home')} className="absolute top-8 left-8 text-stone-500 hover:text-zinc-900 text-xs uppercase tracking-widest z-20">
                ← Back to Home
             </button>
             <GlassCard className="max-w-lg w-full z-10 mx-4">
                  <div className="text-center mb-8">
                     <h2 className="text-2xl font-bold tracking-tight uppercase text-zinc-900">Begin Project</h2>
                     <div className="h-1 w-12 bg-amber-700 mx-auto mt-4"></div>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <Input label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Input label="Phone" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <Input label="Password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <Button type="submit" variant="gold" className="w-full mt-6" disabled={isSyncing}>
                        {isSyncing ? 'Securing Credentials...' : 'Create Account'}
                    </Button>
                  </form>
                  <p className="mt-6 text-center text-sm text-stone-500">
                    <button onClick={() => navigateTo('login')} className="hover:text-amber-700 transition-colors">Back to Login</button>
                  </p>
             </GlassCard>
      </div>
    )
}
