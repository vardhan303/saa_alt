/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // or keep your custom selector if needed
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-600": "var(--color-primary-600)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-active": "var(--color-primary-active)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        "bg-2": "var(--color-bg-2)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        "code-bg": "var(--color-code-bg)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
      },
      boxShadow: {
        card: "0 10px 30px var(--color-shadow, rgba(2,6,23,0.08))",
        dropdown: "0 4px 12px var(--color-shadow-light, rgba(2,6,23,0.04))",
        modal: "0 20px 40px var(--color-shadow-heavy, rgba(2,6,23,0.12))",
        'button-sm': "0 1px 2px rgba(0, 0, 0, 0.05)",
        'button-md': "0 2px 4px rgba(0, 0, 0, 0.1)",
        'button-lg': "0 4px 8px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        pill: "9999px",
      },
      transitionTimingFunction: {
        "in-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "button": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      scale: {
        '95': '0.95',
        '98': '0.98',
      },
      spacing: {
        xxs: "0.25rem",                    // Static
        xs: "0.5rem",                      // Static  
        sm: "0.75rem",                     // Static
        md: "var(--space-4, 1rem)",       // CSS variable with fallback
        lg: "var(--space-6, 1.5rem)",     // CSS variable with fallback
        xl: "var(--space-8, 2rem)",       // CSS variable with fallback
        xxl: "var(--space-12, 3rem)",     // CSS variable with fallback
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xxs: "var(--text-xs, 0.75rem)",
      },
      transitionDuration: {
        'fast': '75ms',
        'normal': '150ms', 
        'slow': '300ms',
        'button-press': '75ms',
      },
    },
  },
  plugins: [],
}
