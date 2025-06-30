import { Client, createRemotes, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";
import { $keysof } from "rbxts-transform-debug";
import { LabelWithInverse } from "shared/theme/catppuccin";

export const BRUSH_ID_ATTRIBUTE = "SelectedBrush";

interface LabelColor {
    type: "label",
    label: LabelWithInverse
}
interface RegularColor {
    type: "regular",
    color: Color3
}

export interface BrushWithoutId {
    name: string,
    material?: Enum.Material,
    color: LabelColor | RegularColor
}
export type Brush = BrushWithoutId & { id: BrushId };

const brushes = {
    blank: {
        name: "Blank",
        color: {
            type: "label",
            label: "Surface1"
        }
    },
    blue: {
        name: "Blue",
        color: {
            type: "label",
            label: "Blue"
        }
    },
    red: {
        name: "Red",
        color: {
            type: "label",
            label: "Red"
        }
    },
    green: {
        name: "Green",
        color: {
            type: "label",
            label: "Green"
        }
    },
    yellow: {
        name: "Yellow",
        color: {
            type: "label",
            label: "Yellow"
        }
    },
    pink: {
        name: "Pink",
        color: {
            type: "label",
            label: "Pink"
        }
    },
    teal: {
        name: "Teal",
        color: {
            type: "label",
            label: "Teal"
        }
    },
    lavender: {
        name: "Lavender",
        color: {
            type: "label",
            label: "Lavender"
        }
    },
    mauve: {
        name: "Mauve",
        color: {
            type: "label",
            label: "Mauve"
        }
    },
    brick: {
        name: "Bricks",
        color: {
            type: "regular",
            color: new Color3(0.7,0.38, 0.2)
        },
        material: Enum.Material.Brick
    }
} satisfies Record<string, BrushWithoutId>;

for (const [k, v] of pairs(brushes)) {
    (v as Brush).id = k;
}

const brushesRetyped = brushes as Record<BrushId, Brush>;
export { brushesRetyped as brushes };

export const allBrushIds: BrushId[] = [];
for (const [key, _] of pairs(brushes)) {
    allBrushIds.push(key);
}

export const selectableBrushes: BrushId[] = [
    "pink",
    "mauve",
    "red",
    "yellow",
    "green",
    "teal",
    "blue",
    "lavender",
    "blank"
]

export type BrushId = keyof typeof brushes;

export const remotes = createRemotes({
    updateBrush: remote<Client, [brush: BrushId]>(t.valueOf(selectableBrushes)),
    setBrush: remote<Server, [brush: BrushId]>(t.valueOf(selectableBrushes))
});