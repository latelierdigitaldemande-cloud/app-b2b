/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Car, 
  ChevronRight, 
  History, 
  LayoutDashboard, 
  Settings, 
  Users, 
  Search,
  Star,
  MapPin,
  Clock,
  Briefcase,
  Leaf,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plane,
  UserCheck,
  Plus,
  MessageSquare,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "./lib/utils";

import { FLEETS } from "./data";

// --- Types ---
interface Fleet {
  id: string;
  name: string;
  description: string;
  rating: number;
  baseRate: number;
  ratePerKm: number;
  availability: string;
  vehicleTypes: string[];
  image: string;
  features: string[];
}

interface Booking {
  id: string;
  employeeName: string;
  fleetId: string;
  fleetName: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
  amount: number;
}

// --- Mock Data ---
const analyticsData = [
  { name: 'Mon', spend: 240, rides: 12 },
  { name: 'Tue', spend: 300, rides: 15 },
  { name: 'Wed', spend: 200, rides: 8 },
  { name: 'Thu', spend: 278, rides: 14 },
  { name: 'Fri', spend: 189, rides: 10 },
  { name: 'Sat', spend: 239, rides: 11 },
  { name: 'Sun', spend: 349, rides: 18 },
];

const SERVICES = [
  { id: 'srv-1', name: "Airport Transfer", description: "Efficient door-to-gate logistics with real-time flight tracking.", image: "https://res.cloudinary.com/dopnnowvl/image/upload/f_auto,q_auto/michael-getreu-12cZv8oxk8k-unsplash_gruvud", icon: <Plane className="w-5 h-5" />, color: "bg-blue-500" },
  { id: 'srv-2', name: "Executive Chauffeur", description: "Vetted professional drivers providing discrete, high-protocol transport.", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2670&auto=format&fit=crop", icon: <UserCheck className="w-5 h-5" />, color: "bg-black" },
  { id: 'srv-3', name: "Team Shuttles", description: "Coordinated logistics for corporate seminars and department movements.", image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2670&auto=format&fit=crop", icon: <Users className="w-5 h-5" />, color: "bg-indigo-500" },
  { id: 'srv-4', name: "VIP Security", description: "Enhanced security details and armored transport for corporate travel.", image: "https://images.unsplash.com/photo-1552084117-56a987666449?q=80&w=2670&auto=format&fit=crop", icon: <ShieldCheck className="w-5 h-5" />, color: "bg-emerald-600" },
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1449156001935-d2861572a78e?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6199f7a09f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613490494273-e47b98cd0d33?q=80&w=800&auto=format&fit=crop"
];

const FAQ_ITEMS = [
  { question: "How do I finalize my reservation?", answer: "Select a vehicle from our catalog to start the process or contact our 24/7 support desk." },
  { question: "Are the vehicles chauffeured?", answer: "We offer both self-drive performance rentals and professional executive chauffeur services." },
  { question: "What is the insurance coverage?", answer: "All bookings include comprehensive premium insurance with 24/7 global roadside assistance." },
  { question: "Can I change my fleet selection?", answer: "Yes, reservations can be modified up to 12 hours before the scheduled arrival through your dashboard." },
];

const OFFERS = [
  { 
    id: 'off-1', 
    title: "Offre Spéciale", 
    subtitle: "20% de réduction sur votre première course", 
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop" 
  },
  { 
    id: 'off-2', 
    title: "Elite Pro", 
    subtitle: "Transfert aéroport offert ce weekend", 
    image: "https://images.unsplash.com/photo-1562519819-016930ada31b?q=80&w=1200&auto=format&fit=crop" 
  },
  { 
    id: 'off-3', 
    title: "Pack Découverte", 
    subtitle: "Chauffeur privé pour 4h à prix fixe", 
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop" 
  }
];

export default function App() {
  const [fleets, setFleets] = useState<Fleet[]>(FLEETS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState<{recommendation: string, bestFleetId: string} | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  useEffect(() => {
    fetchFleets();
    fetchBookings();
  }, []);

  const fetchFleets = async () => {
    try {
      const res = await fetch("/api/fleets");
      if (res.ok) {
        const data = await res.json();
        setFleets(data);
      }
    } catch (err) {
      console.error("Failed to fetch fleets, using local data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const handleCompare = async () => {
    if (!searchQuery) return;
    setIsComparing(true);
    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: searchQuery })
      });
      const data = await res.json();
      setAiRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleBook = async (fleet: Fleet) => {
    const bookingData = {
      employeeName: "Jordan Smith",
      fleetId: fleet.id,
      fleetName: fleet.name,
      pickup: "HQ - 123 Business Way",
      dropoff: "International Airport",
      date: new Date().toISOString(),
      amount: fleet.baseRate + (fleet.ratePerKm * 15)
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        fetchBookings();
        alert(`Request sent to ${fleet.name}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-[var(--color-brand-secondary)] flex flex-col overflow-y-auto hide-scrollbar max-w-md mx-auto relative shadow-2xl">
      {/* Top Header Bar */}
      <div className="bg-black text-white py-8 px-6 shrink-0 z-50 flex justify-between items-center">
        <div>
          <h1 className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/50 mb-0.5">FleetFlow Pro</h1>
          <p className="text-xl font-bold font-sans tracking-tight text-white leading-none">Enterprise Mobility</p>
        </div>
        <div className="flex gap-3">
           <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
              <Zap size={18} className={isComparing ? "text-blue-500" : "text-white/30"} />
           </div>
           <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <Users size={18} className="text-black" />
           </div>
        </div>
      </div>

      <div className="flex-1 space-y-12 pb-8">
        {/* Hero Section */}
        <section className="">
          <div className="relative h-[85vh] overflow-hidden group isolate">
            <img 
              src="https://res.cloudinary.com/dopnnowvl/image/upload/f_auto,q_auto/Image_13-04-2026_à_00.37_rmaerq" 
              alt="Elite Service Car" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            
            <div className="absolute bottom-10 left-8 right-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span className="text-[10px] font-bold text-white/60 tracking-wider">Premium Experience</span>
              </div>
              <h1 className="text-[41px] font-bold text-white font-sans tracking-tight mb-8 leading-[1.1]">
                Future of <br/> Luxury Travel
              </h1>
              <button className="bg-white text-black text-sm font-bold px-[46px] py-[21px] rounded-full transition-all shadow-xl flex items-center gap-3 group/btn hover:bg-opacity-90">
                Explore Fleet
                <ArrowUpRight size={18} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Meilleur Offre */}
        <section className="space-y-6">
           <div className="px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[23px] font-bold font-sans tracking-tight text-black/80">Meilleures offres</h2>
                <ChevronRight size={18} className="text-black/30" />
              </div>
           </div>
           
           <div className="px-4 h-[330px]">
              <OffersCarousel />
           </div>
        </section>

        {/* Section 2.5: Elite Services */}
        <section className="space-y-6">
           <div className="px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[23px] font-bold font-sans tracking-tight text-black/80">Elite services</h2>
                <ChevronRight size={18} className="text-black/30" />
              </div>
           </div>

           <div className="flex overflow-x-auto px-4 gap-4 hide-scrollbar snap-x snap-mandatory">
              {SERVICES.map(service => (
                <div key={service.id} className="min-w-[280px] snap-center py-2">
                  <ServiceCard service={service} />
                </div>
              ))}
           </div>
        </section>

        {/* Section 2: Fleet Catalog */}
        <section className="space-y-6">
           <div className="px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[23px] font-bold font-sans tracking-tight text-black/80">Discover our vehicles</h2>
                <ChevronRight size={18} className="text-black/30" />
              </div>
           </div>

           <div className="space-y-6">
              {aiRecommendation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-4 p-6 bg-blue-600 text-white rounded-[1.5rem] shadow-2xl shadow-blue-500/30 relative overflow-hidden mb-8"
                >
                   <div className="relative z-10">
                      <h4 className="flex items-center gap-2 text-xs font-bold mb-3">
                        <Zap size={14} fill="white" /> Comparison Engine
                      </h4>
                      <p className="text-sm font-bold leading-relaxed opacity-95">{aiRecommendation.recommendation}</p>
                   </div>
                   <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                      <ShieldCheck size={180} />
                   </div>
                </motion.div>
              )}

              <div className="flex overflow-x-auto px-4 gap-4 hide-scrollbar snap-x snap-mandatory">
                 {fleets.map(f => (
                   <div key={f.id} className="min-w-[320px] snap-center py-2">
                     <FleetCard 
                       fleet={f} 
                       onBook={handleBook} 
                       isRecommended={aiRecommendation?.bestFleetId === f.id} 
                     />
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Section 2.6: Atmosphere Gallery */}
        <section className="space-y-6 overflow-hidden">
           <div className="px-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[23px] font-bold font-sans tracking-tight text-black/80">Premium lifestyle</h2>
                <ChevronRight size={18} className="text-black/30" />
              </div>
           </div>

           <div className="relative">
              <div className="flex gap-2">
                 <InfiniteCarousel images={GALLERY_IMAGES} speed={40} />
              </div>
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--color-brand-secondary)] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--color-brand-secondary)] to-transparent z-10 pointer-events-none"></div>
           </div>
        </section>

        {/* Quick Actions Section */}
        <section className="px-4 flex gap-4">
           <button className="flex-1 py-5 bg-white text-black/60 rounded-xl text-[10px] font-bold tracking-widest transition-all uppercase flex items-center justify-center gap-2 mt-2">
             <MessageSquare size={14} />
             Contact Us
           </button>
           <button 
             onClick={() => setIsFAQOpen(true)}
             className="flex-1 py-5 bg-white text-black/60 rounded-xl text-[10px] font-bold tracking-widest transition-all uppercase flex items-center justify-center gap-2 mt-2"
           >
             <HelpCircle size={14} />
             FAQ
           </button>
        </section>

        {/* Section 1: Overview & Intelligence */}
        <section className="px-4 space-y-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 transition-opacity"></div>
            <div className="relative bg-white p-6 rounded-[1.5rem] border border-black/5 shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 mb-4 flex items-center gap-2">
                <Zap size={12} fill="currentColor" /> Live Intelligence
              </p>
              <p className="text-sm font-semibold leading-relaxed opacity-70 mb-6">
                "Welcome Jane. Corporate demand is peaking in South District. Suggest optimizing GreenCommute routes for current arrivals."
              </p>
              <div className="flex gap-3">
                <button className="text-[10px] bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider">Optimize Ledger</button>
                <button className="text-[10px] bg-black/5 text-black/40 px-6 py-3 rounded-xl font-bold uppercase tracking-wider">Dismiss</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Monthly Spend" value="$12.4k" change="+12%" />
            <StatCard label="CO2 Offset" value="2.4T" change="+18%" />
          </div>
        </section>


        {/* Section 3: Activity Ledger */}
        <section className="px-4 space-y-6">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-[23px] font-bold font-sans tracking-tight text-black/80">Recent activity</h2>
                <ChevronRight size={18} className="text-black/30" />
              </div>
           </div>

           <div className="space-y-4">
              {bookings.length > 0 ? bookings.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-[1.5rem] border border-black/5 flex flex-col gap-5 shadow-sm">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-bold tracking-tight opacity-20 uppercase mb-1">Record ID: {b.id.slice(-6)}</p>
                         <h4 className="text-sm font-bold tracking-tight">{b.employeeName}</h4>
                      </div>
                      <StatusPill status={b.status} />
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center">
                         <Car size={20} className="opacity-20" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-bold tracking-tight truncate">{b.fleetName}</p>
                         <p className="text-[10px] font-mono opacity-30 italic">{new Date(b.date).toLocaleDateString()} • Corporate Charge</p>
                      </div>
                      <p className="text-xl font-bold tracking-tighter tabular-nums">${b.amount}</p>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30 italic font-bold">No recent records available.</div>
              )}
           </div>
        </section>

        {/* Section 4: Profile & Settings */}
        <section className="px-4 pb-20 space-y-10">
           <div className="flex flex-col items-center py-12 bg-white rounded-[2.2rem] border border-black/5 shadow-sm">
              <div className="w-28 h-28 rounded-[1.9rem] bg-black text-white flex items-center justify-center text-5xl font-bold font-sans shadow-2xl mb-6">
                FF
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Acme Solutions</h2>
              <p className="text-[10px] font-bold opacity-30 mt-2">Enterprise Lab Tier</p>
              
              <div className="mt-10 mb-8 px-8 py-3 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-wide">
                Active Policy: Priority Eco
              </div>
           </div>

           <div className="space-y-1">
              <SettingsItem label="SSO Authentication" value="Enabled" />
              <SettingsItem label="Billing Period" value="Monthly" />
              <SettingsItem label="Department Limit" value="$15k / mo" />
              <SettingsItem label="Security Vault" value="Configured" />
           </div>

           <div className="p-8 bg-black text-white rounded-[1.9rem] text-center shadow-2xl shadow-black/30 relative overflow-hidden group">
              <div className="relative z-10 transition-transform duration-500">
                <p className="text-[10px] font-bold opacity-30 mb-3">Billing Cycle Progress</p>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                   <p className="text-4xl font-bold tracking-tighter font-sans">14</p>
                   <p className="text-xs font-bold opacity-40 tracking-wider">Days remaining</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-6 shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "65%" }}
                     transition={{ duration: 2, ease: "easeOut" }}
                     className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                   />
                </div>
              </div>
              <div className="absolute -left-12 -top-12 opacity-[0.03] transition-opacity duration-700">
                 <Briefcase size={200} />
              </div>
           </div>
           
           <footer className="text-center pt-8">
              <p className="text-[9px] font-bold opacity-20">&copy; 2026 FleetFlow Pro. All Rights Reserved.</p>
           </footer>
        </section>
      </div>

      {/* FAQ Bottom Sheet Overlay */}
      <AnimatePresence>
        {isFAQOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFAQOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] max-w-md mx-auto"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[2.5rem] p-8 max-w-md mx-auto max-h-[85vh] overflow-y-auto hide-scrollbar shadow-2xl pb-12"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight">Common Questions</h2>
                <button 
                  onClick={() => setIsFAQOpen(false)}
                  className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, idx) => (
                  <FAQItem key={idx} question={item.question} answer={item.answer} />
                ))}
              </div>

              <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100 italic">
                <p className="text-xs font-bold text-blue-700 leading-relaxed">
                  Still need help? Our 24/7 concierge is standing by to assist with your custom logistics.
                </p>
              </div>

              <button 
                onClick={() => setIsFAQOpen(false)}
                className="w-full mt-8 py-5 bg-black text-white rounded-2xl text-[10px] font-bold tracking-widest uppercase shadow-xl"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Mobile Components ---

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return null;
}

// --- Subcomponents ---

function StatCard({ label, value, change }: { label: string, value: string, change: string }) {
  return (
    <div className="native-card p-5">
      <p className="text-[10px] tracking-wider font-bold opacity-30 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-xl font-bold tabular-nums tracking-tighter">{value}</h4>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg", change.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          {change}
        </span>
      </div>
    </div>
  );
}

function FleetProgress({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-bold tracking-wider opacity-40">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-600 text-white shadow-xl shadow-blue-500/20",
    completed: "bg-green-500 text-white shadow-xl shadow-green-500/20"
  };
  return (
    <span className={cn("text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full", styles[status as keyof typeof styles])}>
      {status}
    </span>
  );
}

const FleetCard: React.FC<{ fleet: Fleet, onBook: (f: Fleet) => any, isRecommended: boolean }> = ({ fleet, onBook, isRecommended }) => {
  return (
    <motion.div 
      className={cn(
        "native-card overflow-hidden group transition-all relative h-[200px]",
        isRecommended && "ring-2 ring-blue-500 ring-offset-4 shadow-2xl"
      )}
    >
      <img 
        src={fleet.image} 
        alt={fleet.name} 
        className="absolute inset-0 w-full h-full object-cover grayscale-[15%] transition-all duration-1000 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      
      {isRecommended && (
        <div className="absolute top-5 right-5 bg-blue-500 text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider shadow-xl flex items-center gap-2 ring-4 ring-blue-500/20">
          <Zap size={10} fill="currentColor" /> Smart Match
        </div>
      )}

      <div className="absolute bottom-6 left-6 right-6 text-white">
         <div className="flex items-center gap-2 mb-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
           <p className="text-[10px] font-bold tracking-wide opacity-80 uppercase">{fleet.features.join(" • ")}</p>
         </div>
         
         <h4 className="text-2xl font-bold font-sans tracking-tight leading-none mb-2">{fleet.name}</h4>
      </div>
    </motion.div>
  );
};

function OffersCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[1.9rem] shadow-xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <img 
            src={OFFERS[index].image} 
            alt={OFFERS[index].title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h4 className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">{OFFERS[index].title}</h4>
            <p className="text-lg font-bold text-white leading-tight">{OFFERS[index].subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {OFFERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              index === i ? "bg-white w-4" : "bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  return (
    <div className="native-card overflow-hidden group transition-all relative h-[300px] bg-black rounded-[1.5rem]">
      <img 
        src={service.image} 
        alt={service.name} 
        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        <div className="mb-auto">
           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xl", service.color)}>
             {service.icon}
           </div>
        </div>

        <h4 className="text-xl font-bold font-sans tracking-tight mb-2 leading-none">{service.name}</h4>
        <p className="text-[10px] opacity-60 font-medium leading-relaxed mb-4 line-clamp-2 pr-4">{service.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
           <button className="w-full text-[10px] font-bold tracking-wide bg-white text-black py-3.5 rounded-xl transition-all shadow-2xl">
             Select Service
           </button>
        </div>
      </div>
    </div>
  );
}

function InfiniteCarousel({ images, speed }: { images: string[], speed: number }) {
  const doubledImages = [...images, ...images];
  
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div 
        className="flex gap-2 shrink-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          repeat: Infinity, 
          duration: speed, 
          ease: "linear" 
        }}
        whileHover={{ pause: true }}
      >
        {doubledImages.map((src, idx) => (
          <div key={idx} className="w-64 h-64 rounded-[1.5rem] overflow-hidden border border-black/5 flex-shrink-0">
            <img src={src} alt="Gallery" className="w-full h-full object-cover transition-all duration-700" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-black/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left group"
      >
        <span className="text-sm font-bold text-black/70 transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-black/20"
        >
          <Plus size={16} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-xs leading-relaxed text-black/50 font-medium">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

function SettingsItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/5">
      <span className="text-sm font-medium opacity-50">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
