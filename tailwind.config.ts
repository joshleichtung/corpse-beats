import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable mappings
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Round 1: Innocent
        'pastel-pink': '#FFB3D9',
        'pastel-blue': '#B3E5FC',
        'pastel-mint': '#B5EAD7',
        'pastel-cream': '#FFF8E7',
        // Round 2: Uneasy
        'dusty-rose': '#D4A5A5',
        'wilted-sage': '#A8B8A4',
        'aged-paper': '#F0E6D2',
        // Round 3: Ominous
        'bruised-plum': '#8B5E83',
        'murky-olive': '#6B7A5A',
        'ash-gray': '#C8C8C8',
        // Round 4: Horror
        'blood-red': '#8B0000',
        'rotten-eggplant': '#4A154B',
        'bile-green': '#4A5D23',
        'near-black': '#2C2C2C',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
