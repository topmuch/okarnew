import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OKAR Brand Colors
        okar: {
          // Pinks - Signature Colors
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#db2777',
            700: '#be185d',
            800: '#9d174d',
            900: '#831843',
            950: '#500724',
            // Custom OKAR Pinks
            vibrant: '#FF0080',
            deep: '#BE185D',
            signature: '#DB2777',
            gradient: '#9D174D',
          },
          // Orange Accent
          orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            accent: '#FF6B35',
          },
          // Dark Luxury Backgrounds
          dark: {
            900: '#0F172A',
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
            950: '#030712',
            luxury: '#121214',
            card: '#1A1A22',
            elevated: '#1E1E28',
          },
          // Text Colors
          text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
            muted: '#64748B',
            white: '#FFFFFF',
          },
        },
        // Legacy support
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'okar-pink': '0 4px 20px -2px rgba(219, 39, 119, 0.25)',
        'okar-glow': '0 0 40px rgba(219, 39, 119, 0.15)',
        'luxury': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'luxury-lg': '0 10px 50px rgba(0, 0, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'okar-gradient-pink': 'linear-gradient(135deg, #DB2777 0%, #9D174D 50%, #500724 100%)',
        'okar-gradient-vibrant': 'linear-gradient(135deg, #FF0080 0%, #DB2777 50%, #BE185D 100%)',
        'okar-gradient-accent': 'linear-gradient(135deg, #f97316 0%, #DB2777 100%)',
        'okar-gradient-dark': 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(219, 39, 119, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(219, 39, 119, 0.6)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    }
  },
  plugins: [tailwindcssAnimate],
};

export default config;
