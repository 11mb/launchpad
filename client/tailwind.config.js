/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F9FAFB", // Cool grey/white
                card: "#FFFFFF",
                primary: "#000000",
                secondary: "#6B7280", // Cool grey
                accent: {
                    running: {
                        bg: "#DEF7EC",
                        text: "#03543F",
                    },
                    stopped: {
                        bg: "#F3F4F6",
                        text: "#374151",
                    },
                },
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem', // Generous radius
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Need to import Inter
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Soft shadow
            }
        },
    },
    plugins: [],
}
