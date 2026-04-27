import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  ChefHat,
  Coffee,
  CreditCard,
  MonitorCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth";
const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};
const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};
const signaturePicks = [
  {
    title: "Sunrise Breakfast",
    caption: "Fresh, quick, and filling before first lecture.",
    accent: "from-amber-100/90 to-orange-100/70",
  },
  {
    title: "Studio Lunch",
    caption: "Balanced meals for long lab and project days.",
    accent: "from-emerald-100/80 to-lime-100/60",
  },
  {
    title: "Evening Comfort",
    caption: "Cafe-style bites and warm beverages after class.",
    accent: "from-rose-100/75 to-amber-100/65",
  },
];
const advantages = [
  {
    title: "Live Order Journey",
    copy: "Students see every state from pending to ready without confusion.",
    icon: BellRing,
  },
  {
    title: "Secure Checkout",
    copy: "Razorpay verification keeps transactions safe and reliable.",
    icon: CreditCard,
  },
  {
    title: "Premium Yet Practical",
    copy: "Calm design language with fast actions during busy hours.",
    icon: Sparkles,
  },
];
const operations = [
  {
    title: "Student Mobile Experience",
    copy: "Quick browse, fast re-ordering, and live pickup tracking built for campus pace.",
    icon: Smartphone,
  },
  {
    title: "Staff + Admin Desktop Control",
    copy: "Kitchen queue, pickup verification, and analytics in one clean command surface.",
    icon: MonitorCheck,
  },
];
export default function LandingPage() {
  const { logout } = useAuth();
  return (
    <div className="pb-10">
      <section className="relative overflow-hidden px-4 pb-14 pt-14 md:px-8 md:pb-20 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(186,124,84,0.24),transparent_38%),radial-gradient(circle_at_84%_2%,rgba(62,35,24,0.14),transparent_30%),linear-gradient(180deg,rgba(255,248,240,0.9),rgba(248,243,237,0.7))]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl">
            <Motion.p variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-cocoa-300/80 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cocoa-600">
              <ChefHat size={14} />
              Campus cafe experience
            </Motion.p>
            <Motion.h1 variants={reveal} className="mt-5 font-display text-4xl leading-tight text-cocoa-900 md:text-6xl">
              The college canteen,
              <span className="block text-cocoa-700">styled like a premium cafe.</span>
            </Motion.h1>
            <Motion.p variants={reveal} className="mt-5 max-w-xl text-base leading-relaxed text-cocoa-700 md:text-lg">
              Crafted for students who want speed, clarity, and quality. Order in seconds, track in real time, and pick up smoothly between classes.
            </Motion.p>
            <Motion.div variants={reveal} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-cocoa-900 px-6 py-3 text-sm font-semibold text-ivory-50 transition hover:bg-cocoa-700">
                Start as student
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" onClick={logout} className="rounded-full border border-cocoa-300 bg-white/80 px-6 py-3 text-sm font-semibold text-cocoa-800 transition hover:border-cocoa-500">
                Existing account login
              </Link>
            </Motion.div>
            <Motion.div variants={reveal} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cocoa-600">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={14} />
                Real-time status updates
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={14} />
                Admin + staff dashboards
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck size={14} />
                Secure payment flow
              </span>
            </Motion.div>
          </Motion.div>
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lux-card relative overflow-hidden"
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-cocoa-100/65 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-amber-100/70 blur-2xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.28em] text-cocoa-500">Today in canteen one</p>
              <h2 className="mt-2 font-display text-3xl text-cocoa-900">House Signature Board</h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Paneer Sandwich", "Breakfast", "Rs. 90"],
                  ["Rajma Rice", "Lunch", "Rs. 110"],
                  ["Cold Coffee", "Beverage", "Rs. 80"],
                ].map((row) => (
                  <div key={row[0]} className="flex items-center justify-between rounded-xl border border-sand-300 bg-white/85 px-4 py-3">
                    <div>
                      <p className="font-semibold text-cocoa-900">{row[0]}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-cocoa-500">{row[1]}</p>
                    </div>
                    <p className="font-display text-2xl text-cocoa-900">{row[2]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-cocoa-300/70 bg-cocoa-900 px-4 py-3 text-ivory-50">
                <p className="text-sm">Average pickup readiness</p>
                <p className="font-display text-2xl">12 mins</p>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-6 md:px-8">
        <Motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <Motion.article key={item.title} variants={reveal} className="lux-card">
                <span className="inline-flex rounded-full border border-sand-300 bg-white p-2 text-cocoa-800">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-2xl text-cocoa-900">{item.title}</h3>
                <p className="mt-2 text-cocoa-700">{item.copy}</p>
              </Motion.article>
            );
          })}
        </Motion.div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-6 md:px-8">
        <div className="lux-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cocoa-500">Curated feel</p>
              <h2 className="mt-2 font-display text-4xl text-cocoa-900">Signature campus moods</h2>
            </div>
            <p className="max-w-lg text-sm text-cocoa-700 md:text-base">
              Not a generic canteen dashboard. This is designed to feel like a modern cafe while still being built for fast student ordering.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {signaturePicks.map((item) => (
              <article key={item.title} className={`rounded-2xl border border-sand-300 bg-gradient-to-br ${item.accent} p-5`}>
                <p className="inline-flex items-center gap-1 rounded-full border border-cocoa-300 bg-white/70 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-cocoa-600">
                  <Coffee size={12} />
                  Signature
                </p>
                <h3 className="mt-3 font-display text-3xl text-cocoa-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-700">{item.caption}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-6 md:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {operations.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="lux-card">
                <span className="inline-flex rounded-full border border-sand-300 bg-white p-2 text-cocoa-800">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-3xl text-cocoa-900">{item.title}</h3>
                <p className="mt-2 text-cocoa-700">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pt-2 md:px-8">
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-cocoa-300 bg-cocoa-900 px-6 py-9 text-ivory-50 md:px-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cocoa-700/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-6 h-56 w-56 rounded-full bg-amber-100/20 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100">Ready for launch</p>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">Give your students a canteen they enjoy using daily.</h2>
              <p className="mt-3 text-sm text-amber-100 md:text-base">
                Fast order flow for students, smooth queue operations for staff, and clear revenue visibility for admins.
              </p>
            </div>
            <Link to="/register" onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-ivory-50 px-6 py-3 text-sm font-semibold text-cocoa-900 transition hover:bg-amber-50">
              Create your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </Motion.div>
      </section>
    </div>
  );
}
