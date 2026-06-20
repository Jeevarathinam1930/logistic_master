/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'primary-light': '#EFF6FF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        success: '#10B981',
        'success-light': '#ECFDF5',
        warning: '#F59E0B',
        'warning-light': '#FFFBEB',
        danger: '#EF4444',
        'danger-light': '#FEF2F2',
      },
      borderRadius: {
        card: '12px',
        'card-lg': '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        sidebar: '0 0 0 1px rgb(0 0 0 / 0.04)',
        header: '0 1px 3px 0 rgb(0 0 0 / 0.02)',
      },
      spacing: {
        sidebar: '240px',
      },
    },
  },
  plugins: [],
};
