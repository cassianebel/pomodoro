/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      display: ['"Changa One"'],
      body: ['"Barlow Condensed"'],
    },
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant("landscape", "@media (orientation: landscape)");
    },
    function ({ addVariant }) {
      addVariant("mozilla", "@supports (-moz-appearance: none)");
    },
    function ({ addUtilities }) {
      addUtilities({
        ".shadow-inner-dark": {
          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.4)",
        },
      });
    },
  ],
};
