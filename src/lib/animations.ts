import type { Variants, Transition } from "framer-motion";

// ─── Transition Presets ───

const smooth: Transition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.5,
};

const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

// ─── Entrance Animations ───

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...smooth, duration: 0.6 },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...smooth, duration: 0.6 },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...smooth, duration: 0.6 },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...smooth, duration: 0.6 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { ...smooth, duration: 0.5 },
  },
};

// ─── Scale ───

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...smooth, duration: 0.4 },
  },
};

// ─── Stagger (for product grids, lists) ───

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...smooth, duration: 0.5 },
  },
};

// ─── Page Transitions ───

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { ...smooth, duration: 0.4 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { ...smooth, duration: 0.3 },
  },
};

// ─── Scroll Reveal (use with whileInView) ───

export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...smooth,
      duration: 0.7,
    },
  },
};

/** Default viewport config for scroll-triggered animations */
export const scrollRevealViewport = {
  once: true,
  amount: 0.2 as const,
  margin: "-50px" as const,
};

// ─── Slide In (for drawers, sheets, mobile menus) ───

export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...smooth, duration: 0.4 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { ...smooth, duration: 0.3 },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...smooth, duration: 0.4 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { ...smooth, duration: 0.3 },
  },
};

export const slideInBottom: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { ...smooth, duration: 0.4 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { ...smooth, duration: 0.3 },
  },
};

// ─── Interactive Feedback ───

export const hoverScale = {
  scale: 1.03,
  transition: spring,
} as const;

export const tapScale = {
  scale: 0.97,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
} as const;

// ─── Shimmer (loading skeletons) ───

export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 2,
      ease: "linear",
    },
  },
};

// ─── Overlay / Backdrop ───

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// ─── Accordion / Collapse ───

export const collapse: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: "hidden",
  },
  visible: {
    height: "auto",
    opacity: 1,
    overflow: "hidden",
    transition: {
      height: { ...smooth, duration: 0.3 },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
};
