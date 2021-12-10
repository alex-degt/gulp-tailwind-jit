module.exports = {
	mode: "jit",
	content: ["./src/**/*.pug", "./docs/js/scripts.min.js"],
	// darkMode: false,
	theme: {
		// Все что будет объявлено внутри theme - перезапишет существующие стили в Tailwind CSS
		// colors: {
		// 	"primary-50": "#0031dc",
		// },
		// Всё что будет объявлено внутри extend - добавит стили к уже существующим внутри Tailwind CSS, а не переопределит их
		extend: {
			colors: {
				// Primary
				"primary-50": "var(--primary-50)",
				"primary-100": "var(--primary-100)",
				"primary-200": "var(--primary-200)",
				"primary-300": "var(--primary-300)",
				"primary-400": "var(--primary-400)",
				"primary-500": "var(--primary-500)",
				"primary-600": "var(--primary-600)",
				"primary-700": "var(--primary-700)",
				"primary-800": "var(--primary-800)",
				"primary-900": "var(--primary-900)",

				// Gray
				"gray-50": "var(--gray-50)",
				"gray-100": "var(--gray-100)",
				"gray-200": "var(--gray-200)",
				"gray-300": "var(--gray-300)",
				"gray-400": "var(--gray-400)",
				"gray-500": "var(--gray-500)",
				"gray-600": "var(--gray-600)",
				"gray-700": "var(--gray-700)",
				"gray-800": "var(--gray-800)",
				"gray-900": "var(--gray-900)",

				// Info colors
				success: "var(--success)",
				warning: "var(--warning)",
				info: "var(--info)",
				error: "var(--error)",

				// System colors
				white: "var(--white)",
				black: "var(--black)",
				transparent: "var(--transparent)",
				overlay: "var(--overlay)",
			},
			container: {
				center: true,
				padding: "1rem",
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [require("@tailwindcss/line-clamp"), require("@tailwindcss/aspect-ratio")],
};
