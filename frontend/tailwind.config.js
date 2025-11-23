/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#4F46E5', // Indigo 600 - Vibrant Blue
                    secondary: '#EC4899', // Pink 500 - Vibrant Pink
                    accent: '#F59E0B', // Amber 500 - Warm Accent
                    dark: '#1E293B', // Slate 800 - Text
                    light: '#F8FAFC', // Slate 50 - Background
                    white: '#FFFFFF',
                    glass: 'rgba(255, 255, 255, 0.7)',
                    'glass-border': 'rgba(255, 255, 255, 0.5)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Clean, modern font
                display: ['Outfit', 'sans-serif'], // Friendly display font
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                }
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            }
        },
    },
    plugins: [],
}
