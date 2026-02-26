import { ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchPlansByGymId, fetchGymById } from "../lib/api";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface Plan {
    id: string;
    name: string;
    price: string;
    planBasePrice: string;
    dayPassTotal: string;
    showDayPassStrike: boolean;
    showPlanBaseStrike: boolean;
    dayPassPrice: number;
    duration: string;
    features: string[];
    popular?: boolean;
    savingsLabel?: string | null;
    extraDiscountLabel?: string | null;
    promoDiscount: number;
    stage1Discount: number;
    stage2Discount: number;
}

export function MembershipPlansScreen({
    gymId,
    onBack,
    onSelectPlan,
    venueType = "gym"
}: {
    gymId: string | null;
    onBack: () => void;
    onSelectPlan: (plan: any) => void;
    venueType?: "gym" | "other"
}) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (gymId) {
            Promise.all([
                fetchPlansByGymId(gymId),
                fetchGymById(gymId)
            ])
                .then(([plansData, gymData]) => {
                    const mappedPlans = plansData.map((plan: any) => {
                        const planBasePrice = plan.price;
                        const promoDiscount = plan.discount || 0;
                        const finalPriceValue = Math.round(planBasePrice * (1 - promoDiscount / 100));
                        const dayPassTotal = (gymData.baseDayPassPrice || 0) * (plan.sessions || 1);

                        let savingsLabel = null;
                        let extraDiscountLabel = null;

                        if (dayPassTotal > 0 && plan.sessions > 1) {
                            const totalSavingPercent = Math.round((1 - (finalPriceValue / dayPassTotal)) * 100);
                            if (totalSavingPercent > 0) {
                                savingsLabel = `${totalSavingPercent}% TOTAL SAVINGS`;
                            }
                        }

                        if (promoDiscount > 0) {
                            extraDiscountLabel = `${promoDiscount}% EXTRA DISCOUNT`;
                        }

                        return {
                            id: plan._id,
                            name: plan.name,
                            price: `₹${finalPriceValue.toLocaleString()}`,
                            planBasePrice: `₹${planBasePrice.toLocaleString()}`,
                            dayPassTotal: `₹${dayPassTotal.toLocaleString()}`,
                            showDayPassStrike: dayPassTotal > planBasePrice,
                            showPlanBaseStrike: promoDiscount > 0,
                            dayPassPrice: gymData.baseDayPassPrice,
                            duration: `/${plan.duration}`,
                            sessions: plan.sessions,
                            features: plan.features || [],
                            popular: plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('popular'),
                            savingsLabel,
                            extraDiscountLabel,
                            promoDiscount,
                            stage1Discount: dayPassTotal > 0 ? Math.round((1 - (planBasePrice / dayPassTotal)) * 100) : 0,
                            stage2Discount: promoDiscount
                        };
                    });
                    setPlans(mappedPlans);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [gymId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full bg-white flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Go back">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black uppercase italic tracking-tight">Select your plan</h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="space-y-6 pb-10">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                                localStorage.setItem('last_selected_plan', JSON.stringify(plan));
                                onSelectPlan(plan);
                            }}
                            className={`relative border rounded-[32px] p-6 transition-all hover:shadow-xl cursor-pointer group ${plan.popular
                                ? 'bg-gray-900 border-gray-900 text-white shadow-2xl scale-[1.02]'
                                : 'bg-white border-gray-100 text-gray-900'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-8 bg-accent text-accent-foreground text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                                    <Zap className="w-3 h-3 fill-current" />
                                    Most Popular
                                </div>
                            )}

                            <div className="absolute top-3 right-8 flex flex-col items-end gap-1.5">
                                {plan.extraDiscountLabel && (
                                    <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                                        <Zap className="w-3 h-3 fill-current" /> {plan.extraDiscountLabel}
                                    </div>
                                )}
                                {plan.savingsLabel && (
                                    <div className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
                                        {plan.savingsLabel}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className={`font-black text-xl italic uppercase tracking-tight mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h4>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black italic tracking-tighter">{plan.price}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-widest ${plan.popular ? 'text-white/40' : 'text-gray-400'}`}>
                                                {plan.duration}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {plan.showDayPassStrike && plan.stage1Discount > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest line-through ${plan.popular ? 'text-white/30' : 'text-gray-400'}`}>
                                                        {plan.dayPassTotal}
                                                    </span>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                        {plan.stage1Discount}% OFF
                                                    </span>
                                                </div>
                                            )}
                                            {plan.showPlanBaseStrike && (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest line-through ${plan.popular ? 'text-white/30' : 'text-gray-400'}`}>
                                                        {plan.planBasePrice}
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                        {plan.stage2Discount}% EXTRA DISCOUNT
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${plan.popular ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <CheckCircle2 className="w-6 h-6" />
                                </motion.div>
                            </div>

                            <div className="space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${plan.popular ? 'bg-primary' : 'bg-gray-300'}`} />
                                        <span className={`text-xs font-bold leading-none ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Selection Info Footer */}
            <div className="p-6 bg-white border-t border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    All plans include basic equipment access & support
                </p>
            </div>
        </motion.div>
    );
}
