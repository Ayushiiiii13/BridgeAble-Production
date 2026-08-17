/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bridgeable: {
                    navy: '#0F172A',
                    blue: '#1D4ED8',
                    teal: '#0D9488',
                    cyan: '#06B6D4',
                    gray: '#F8FAFC'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
