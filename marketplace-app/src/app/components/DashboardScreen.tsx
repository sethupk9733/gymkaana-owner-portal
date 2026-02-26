import { ArrowLeft, Calendar, MapPin, QrCode, Clock, Trophy, ChevronRight, X, Info, Dumbbell, Users, Bike, Droplets, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { QRModal } from "./ui/QRModal";
import { ActivePassCard } from "./ui/ActivePassCard";
import { fetchMyBookings } from "../lib/api";

export function DashboardScreen({ onBack, onHome, profile }: { onBack: () => void; onHome: () => void; profile: any }) {
  const [showQR, setShowQR] = useState(false);
  const [showVenueGuide, setShowVenueGuide] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userPhoto = profile?.profileImage;

  useEffect(() => {
    console.log("Mobile Dashboard: Fetching bookings...");
    fetchMyBookings().then(data => {
      console.log("Mobile Dashboard: Received bookings:", data);
      console.log("Mobile Dashboard: Number of bookings:", data?.length || 0);
      setBookings(data);
      setLoading(false);
    }).catch(err => {
      console.error("Mobile Dashboard: Error fetching bookings:", err);
      setLoading(false);
    });
  }, []);

  const activeBooking = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.bookingDate).getTime() - new Date(a.createdAt || a.bookingDate).getTime())
    .find(b => ['active', 'Active', 'upcoming', 'Upcoming'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'Completed', 'cancelled', 'Cancelled'].includes(b.status));

  console.log("Mobile Dashboard: Active booking:", activeBooking);
  console.log("Mobile Dashboard: Past bookings count:", pastBookings.length);

  const mappedActivePass = activeBooking ? {
    id: activeBooking._id,
    gymName: activeBooking.gymId?.name || "Gym",
    gymLogo: activeBooking.gymId?.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000",
    planName: activeBooking.planId?.name || "Membership",
    validFrom: new Date(activeBooking.startDate).toLocaleDateString(),
    validUntil: new Date(activeBooking.endDate).toLocaleDateString(),
    daysLeft: Math.ceil((new Date(activeBooking.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    location: activeBooking.gymId?.location || activeBooking.gymId?.address || "Location",
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`GYMKAANA-${activeBooking._id}`)}&t=${Date.now()}`,
    houseRules: activeBooking.gymId?.houseRules || [],
    facilities: activeBooking.gymId?.facilities || []
  } : null;

  console.log('Mobile Dashboard: Active Pass:', mappedActivePass);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="h-full bg-white flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            {profile?.name ? `${profile.name}'s Dashboard` : 'Your Dashboard'}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
        {/* Active Membership */}
        <div className="mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Active Membership</h3>
          {mappedActivePass && (
            <ActivePassCard
              pass={mappedActivePass}
              onClick={() => setShowQR(true)}
              userPhoto={userPhoto}
            />
          )}
          {!mappedActivePass && (
            <div className="bg-white border border-gray-100 border-dashed rounded-3xl p-10 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Active Membership</p>
              <button onClick={onHome} className="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Browse Gyms</button>
            </div>
          )}
        </div>

        {/* Past Bookings */}
        <div className="pb-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-1">Recent Activity</h3>
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        #
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 italic uppercase tracking-tight">{booking.gymId?.name || "Gym"}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{booking.planId?.name || "Member"} Access</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-black text-gray-900 italic mb-1">₹{booking.amount}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${booking.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-300">ID: {booking._id.slice(-8).toUpperCase()}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest">No past activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0">
        <motion.button
          whileHover={{ x: 5 }}
          onClick={onHome}
          className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-2"
        >
          Discover New Venues <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
      <AnimatePresence>
        {showQR && mappedActivePass && (
          <QRModal pass={mappedActivePass} onClose={() => setShowQR(false)} userPhoto={userPhoto} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
