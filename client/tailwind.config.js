/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./public/index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				background: "oklch(1 0 0)",
				foreground: "oklch(.141 .005 285.823)",
				primary: "oklch(.723 .219 149.579)",
				"primary-foreground": "oklch(.982 .018 155.826)",
				secondary: "oklch(.967 .001 286.375)",
				"secondary-foreground": "oklch(.21 .006 285.885)",
				muted: "oklch(.967 .001 286.375)",
				"muted-foreground": "oklch(.552 .016 285.938)",
				accent: "oklch(.967 .001 286.375)",
				"accent-foreground": "oklch(.21 .006 285.885)",
				destructive: "oklch(.577 .245 27.325)",
				border: "oklch(.92 .004 286.32)",
				input: "oklch(.92 .004 286.32)",
				ring: "oklch(.723 .219 149.579)",
			},
			borderRadius: {
				DEFAULT: "0.5rem",
			},
		},
	},
	plugins: [],
};
