import { Search, Dumbbell, Users, Award, TrendingUp, MapPin, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VenueCard } from "./ui/VenueCard";
import { useEffect, useState, useMemo } from "react";
import { fetchGyms } from "../lib/api";

const SPECIALIZATIONS = [
  "Bodybuilding", "CrossFit", "Yoga", "Zumba", "MMA/Kickboxing",
  "Pilates", "Powerlifting", "Aerobics", "Calisthenics",
  "Swimming", "Cardio", "Strength Training"
];

const HERO_CONTENT = [
  {
    heading: <>FUEL THE <br /><span className="text-primary italic underline decoration-white/20 decoration-4 underline-offset-4">PASSION.</span></>,
    subline: "UNIVERSAL ACCESS TO ELITE VENUES"
  },
  {
    heading: <>LEVEL UP <br /><span className="text-primary italic underline decoration-white/20 decoration-4 underline-offset-4">YOUR GAME.</span></>,
    subline: "PREMIUM TRAINING GROUNDS NEAR YOU"
  },
  {
    heading: <>UNLEASH THE <br /><span className="text-primary italic underline decoration-white/20 decoration-4 underline-offset-4">BEAST.</span></>,
    subline: "YOUR UNIVERSAL TICKET TO FITNESS"
  }
];

export function HomeScreen({ onGymClick, onProfile, onExplore }: { onGymClick: (gymId: any) => void; onProfile: () => void; onExplore: () => void }) {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(10); // Default 10km radius
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [activeHero, setActiveHero] = useState(HERO_CONTENT[0]);

  useEffect(() => {
    setActiveHero(HERO_CONTENT[Math.floor(Math.random() * HERO_CONTENT.length)]);
    fetchGyms()
      .then(data => {
        setGyms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const parseDistance = (location: string) => {
    const match = location.match(/(\d+(\.\d+)?)\s*km/);
    return match ? parseFloat(match[1]) : 0;
  };

  const filteredGyms = useMemo(() => {
    return gyms.filter(gym => {
      const distance = parseDistance(gym.location || "");
      const matchesSearch = gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistance = distance <= maxDistance;

      const gymSpecs = Array.isArray(gym.specializations) ? gym.specializations : [];
      const matchesDisciplines = selectedDisciplines.length === 0 ||
        selectedDisciplines.some(selected =>
          gymSpecs.some((spec: string) => spec.toLowerCase() === selected.toLowerCase())
        );

      return matchesSearch && matchesDistance && matchesDisciplines;
    });
  }, [gyms, searchQuery, maxDistance, selectedDisciplines]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-background overflow-y-auto no-scrollbar scroll-smooth"
    >
      {/* Branding & Logo - This part will scroll away */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-2xl font-[1000] tracking-[-0.08em] uppercase flex items-center -skew-x-12">
              <span className="text-secondary">GYM</span>
              <span className="text-primary italic mx-0.5">KAA</span>
              <span className="text-secondary">NA</span>
            </h1>
          </motion.div>

          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onProfile}
            className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border-2 border-white shadow-lg"
          >
            <Users className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Sticky High-Impact Header Section */}
      <div className="sticky top-0 z-30 p-6 pt-0">
        {/* Dynamic Tagline Container */}
        <div className="bg-secondary p-8 rounded-[32px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            {/* Tagline Part - Hidden on Scroll (Simulated by sticky overlap or just let it scroll inside if desired, but here we'll keep it as one unit that stays) */}
            {/* Actually, user wants "the header has to scroll above the list or once started scrolling i just need the search bar and the browse discipline" */}
            {/* To achieve this perfectly, we split the card: tagline scrolls, search+disciplines stick. */}

            <div className="mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-3">
                {activeHero.heading}
              </h2>
              <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                {activeHero.subline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 z-40 px-6 -mt-20 mb-4">
        <div className="bg-secondary/95 backdrop-blur-3xl p-5 rounded-[28px] shadow-2xl border border-white/10">
          {/* Nested Search Bar Container */}
          <div className="flex gap-3 mb-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center gap-3 group transition-all"
            >
              <Search className="w-5 h-5 text-white/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues or sports..."
                className="flex-1 bg-transparent outline-none text-sm font-black text-white placeholder:text-white/20"
              />
            </motion.div>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white/10 border-white/20 text-white/40'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Specialized Disciplines Filter */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex gap-2.5 min-w-max">
              {SPECIALIZATIONS.map((discipline, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDisciplines(prev =>
                      prev.includes(discipline)
                        ? prev.filter(d => d !== discipline)
                        : [...prev, discipline]
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${selectedDisciplines.includes(discipline)
                    ? 'bg-white border-white text-secondary shadow-lg'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                    }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {discipline}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        {/* Distance Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-6 mb-6"
            >
              <div className="bg-gray-900 rounded-[32px] p-6 shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full" />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Distance Radius</h3>
                    <div className="flex gap-2">
                      {[5, 10, 25, 50].map(d => (
                        <button
                          key={d}
                          onClick={() => setMaxDistance(d)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${maxDistance === d ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                          {d}KM
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                    title="Distance Radius Slider"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gym Listings */}
        <div className="px-6 pb-20">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Discovery Portal</h3>
              <p className="text-2xl font-black italic tracking-tight text-gray-900 uppercase">
                {filteredGyms.length} Protocol Matches
              </p>
            </div>
            {!searchQuery && !showFilters && (
              <button
                onClick={onExplore}
                className="text-[10px] font-[1000] text-black uppercase tracking-widest border-b-2 border-primary pb-1"
              >
                VIEW HUB
              </button>
            )}
          </div>

          {filteredGyms.length > 0 ? (
            <div className="space-y-6 pb-10">
              {filteredGyms.map((gym, index) => (
                <motion.div
                  key={gym._id || gym.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  layout
                >
                  <VenueCard
                    gym={gym}
                    onClick={() => onGymClick(gym._id || gym.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-black italic uppercase tracking-tight text-gray-900 mb-2">No Venues Found</h4>
              <p className="text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-wide">Try adjusting your search or increasing the distance radius.</p>
              {(searchQuery || maxDistance !== 10 || selectedDisciplines.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setMaxDistance(10);
                    setSelectedDisciplines([]);
                  }}
                  className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary pb-1"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-10 border-t border-gray-100 mt-10 text-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} VUEGAM SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
      </div>
    </motion.div >
  );
}
