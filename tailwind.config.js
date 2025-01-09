/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ['"Changa One"'],
      body: ['"Barlow Condensed"'],
    },
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".shadow-inner-dark": {
          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.4)",
        },
      });
    },
  ],
};
