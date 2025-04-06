/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'var(--font-geist-sans)', 'sans-serif'],
                mono: ['Roboto Mono', 'var(--font-geist-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
} 