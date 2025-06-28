/*
    Colors ported from https://catppuccin.com/ (https://github.com/catppuccin)
*/

type Color = Color3;

export type Flavor = "latte" | "frappe" | "macchiato" | "mocha";

export interface FlavorInfo {
	id: Flavor;
    name: string;
    emoji: string;
	inverse: Flavor;
	colors: Palette;
	dark: boolean;
	light: boolean;
}

export interface Palette {
	Rosewater: Color;
	Flamingo: Color;
	Pink: Color;
	Mauve: Color;
	Red: Color;
	Maroon: Color;
	Peach: Color;
	Yellow: Color;
	Green: Color;
	Teal: Color;
	Sky: Color;
	Sapphire: Color;
	Blue: Color;
	Lavender: Color;
	Text: Color;
	Subtext1: Color;
	Subtext0: Color;
	Overlay2: Color;
	Overlay1: Color;
	Overlay0: Color;
	Surface2: Color;
	Surface1: Color;
	Surface0: Color;
	Base: Color;
	Mantle: Color;
	Crust: Color;
}

export type Label = keyof Palette;
export type LabelWithInverse = Label | `Inverse${Label}`;

export const palettes: Record<Flavor, FlavorInfo> = {
	latte: {
		id: "latte",
        name: "Latte",
        emoji: "🌻",
		inverse: "mocha",
		light: true,
		dark: false,
		colors: {
			Rosewater: Color3.fromHex("#dc8a78"),
			Flamingo: Color3.fromHex("#dd7878"),
			Pink: Color3.fromHex("#ea76cb"),
			Mauve: Color3.fromHex("#8839ef"),
			Red: Color3.fromHex("#d20f39"),
			Maroon: Color3.fromHex("#e64553"),
			Peach: Color3.fromHex("#fe640b"),
			Yellow: Color3.fromHex("#df8e1d"),
			Green: Color3.fromHex("#40a02b"),
			Teal: Color3.fromHex("#179299"),
			Sky: Color3.fromHex("#04a5e5"),
			Sapphire: Color3.fromHex("#209fb5"),
			Blue: Color3.fromHex("#1e66f5"),
			Lavender: Color3.fromHex("#7287fd"),
			Text: Color3.fromHex("#4c4f69"),
			Subtext1: Color3.fromHex("#5c5f77"),
			Subtext0: Color3.fromHex("#6c6f85"),
			Overlay2: Color3.fromHex("#7c7f93"),
			Overlay1: Color3.fromHex("#8c8fa1"),
			Overlay0: Color3.fromHex("#9ca0b0"),
			Surface2: Color3.fromHex("#acb0be"),
			Surface1: Color3.fromHex("#bcc0cc"),
			Surface0: Color3.fromHex("#ccd0da"),
			Base: Color3.fromHex("#eff1f5"),
			Mantle: Color3.fromHex("#e6e9ef"),
			Crust: Color3.fromHex("#dce0e8"),
		},
	},
	frappe: {
		id: "frappe",
        name: "Frappé",
        emoji: "🪴",
		inverse: "latte",
		light: false,
		dark: true,
		colors: {
			Rosewater: Color3.fromHex("#f2d5cf"),
			Flamingo: Color3.fromHex("#eebebe"),
			Pink: Color3.fromHex("#f4b8e4"),
			Mauve: Color3.fromHex("#ca9ee6"),
			Red: Color3.fromHex("#e78284"),
			Maroon: Color3.fromHex("#ea999c"),
			Peach: Color3.fromHex("#ef9f76"),
			Yellow: Color3.fromHex("#e5c890"),
			Green: Color3.fromHex("#a6d189"),
			Teal: Color3.fromHex("#81c8be"),
			Sky: Color3.fromHex("#99d1db"),
			Sapphire: Color3.fromHex("#85c1dc"),
			Blue: Color3.fromHex("#8caaee"),
			Lavender: Color3.fromHex("#babbf1"),
			Text: Color3.fromHex("#c6d0f5"),
			Subtext1: Color3.fromHex("#b5bfe2"),
			Subtext0: Color3.fromHex("#a5adce"),
			Overlay2: Color3.fromHex("#949cbb"),
			Overlay1: Color3.fromHex("#838ba7"),
			Overlay0: Color3.fromHex("#737994"),
			Surface2: Color3.fromHex("#626880"),
			Surface1: Color3.fromHex("#51576d"),
			Surface0: Color3.fromHex("#414559"),
			Base: Color3.fromHex("#303446"),
			Mantle: Color3.fromHex("#292c3c"),
			Crust: Color3.fromHex("#232634"),
		},
	},
	macchiato: {
		id: "macchiato",
        name: "Macchiato",
        emoji: "🌺",
		inverse: "latte",
		light: false,
		dark: true,
		colors: {
			Rosewater: Color3.fromHex("#f4dbd6"),
			Flamingo: Color3.fromHex("#f0c6c6"),
			Pink: Color3.fromHex("#f5bde6"),
			Mauve: Color3.fromHex("#c6a0f6"),
			Red: Color3.fromHex("#ed8796"),
			Maroon: Color3.fromHex("#ee99a0"),
			Peach: Color3.fromHex("#f5a97f"),
			Yellow: Color3.fromHex("#eed49f"),
			Green: Color3.fromHex("#a6da95"),
			Teal: Color3.fromHex("#8bd5ca"),
			Sky: Color3.fromHex("#91d7e3"),
			Sapphire: Color3.fromHex("#7dc4e4"),
			Blue: Color3.fromHex("#8aadf4"),
			Lavender: Color3.fromHex("#b7bdf8"),
			Text: Color3.fromHex("#cad3f5"),
			Subtext1: Color3.fromHex("#b8c0e0"),
			Subtext0: Color3.fromHex("#a5adcb"),
			Overlay2: Color3.fromHex("#939ab7"),
			Overlay1: Color3.fromHex("#8087a2"),
			Overlay0: Color3.fromHex("#6e738d"),
			Surface2: Color3.fromHex("#5b6078"),
			Surface1: Color3.fromHex("#494d64"),
			Surface0: Color3.fromHex("#363a4f"),
			Base: Color3.fromHex("#24273a"),
			Mantle: Color3.fromHex("#1e2030"),
			Crust: Color3.fromHex("#181926"),
		},
	},
	mocha: {
		id: "mocha",
        name: "Mocha",
        emoji: "🌿",
		inverse: "latte",
		light: false,
		dark: true,
		colors: {
			Rosewater: Color3.fromHex("#f5e0dc"),
			Flamingo: Color3.fromHex("#f2cdcd"),
			Pink: Color3.fromHex("#f5c2e7"),
			Mauve: Color3.fromHex("#cba6f7"),
			Red: Color3.fromHex("#f38ba8"),
			Maroon: Color3.fromHex("#eba0ac"),
			Peach: Color3.fromHex("#fab387"),
			Yellow: Color3.fromHex("#f9e2af"),
			Green: Color3.fromHex("#a6e3a1"),
			Teal: Color3.fromHex("#94e2d5"),
			Sky: Color3.fromHex("#89dceb"),
			Sapphire: Color3.fromHex("#74c7ec"),
			Blue: Color3.fromHex("#89b4fa"),
			Lavender: Color3.fromHex("#b4befe"),
			Text: Color3.fromHex("#cdd6f4"),
			Subtext1: Color3.fromHex("#bac2de"),
			Subtext0: Color3.fromHex("#a6adc8"),
			Overlay2: Color3.fromHex("#9399b2"),
			Overlay1: Color3.fromHex("#7f849c"),
			Overlay0: Color3.fromHex("#6c7086"),
			Surface2: Color3.fromHex("#585b70"),
			Surface1: Color3.fromHex("#45475a"),
			Surface0: Color3.fromHex("#313244"),
			Base: Color3.fromHex("#1e1e2e"),
			Mantle: Color3.fromHex("#181825"),
			Crust: Color3.fromHex("#11111b"),
		},
	},
};

export function getFlavor(id: Flavor): FlavorInfo {
	return palettes[id];
}
export function getInverse(id: Flavor): FlavorInfo {
	return palettes[palettes[id].inverse];
}

const labels: Label[] = [
    "Rosewater",
    "Flamingo",
    "Pink",
    "Mauve",
    "Red",
    "Maroon",
    "Peach",
    "Yellow",
    "Green",
    "Teal",
    "Sky",
    "Sapphire",
    "Blue",
    "Lavender",
    "Text",
    "Subtext1",
    "Subtext0",
    "Overlay2",
    "Overlay1",
    "Overlay0",
    "Surface2",
    "Surface1",
    "Surface0",
    "Base",
    "Mantle",
    "Crust",
];
const flavors: Flavor[] = [];

// for (const [key, _] of pairs(palettes.frappe.colors)) {
//     colorKeys.push(key);
// }
for (const [key, _] of pairs(palettes)) {
    flavors.push(key);
}

export {
    labels,
    flavors
};