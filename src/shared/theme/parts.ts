import { CollectionService, TweenService, Workspace } from "@rbxts/services";
import { $print } from "rbxts-transform-debug";
import { Label, labels } from "shared/theme/catppuccin";
import { flavorManager } from "./flavorManager";
import { EASE_DIRECTION, EASE_DURATION, EASE_FUNCTION } from "./easing";

const THEMED_PART_TAG = "FlavoredPart";
const COLOR_ROLE_ATTRIBUTE = "ColorLabel";

interface PartInformation {
    color: Label,
    listeners: RBXScriptConnection[]
}

type Colorable = BasePart;

const registeredParts: Map<Colorable, PartInformation> = new Map();

$print("Registering parts...");
for (const part of CollectionService.GetTagged(THEMED_PART_TAG)) {
    if (!part.IsA("BasePart")) continue;
    registerPart(part)
}

CollectionService.GetInstanceAddedSignal(THEMED_PART_TAG).Connect(part => {
    if (!part.IsA("BasePart")) return;
    registerPart(part)
})

CollectionService.GetInstanceRemovedSignal(THEMED_PART_TAG).Connect(part => {
    if (!part.IsA("BasePart")) return;
    $print("Part removed!");
    unregisterPart(part);
})
$print("Ready!");

flavorManager.changed.Connect(flavor => {
    for (const [part, info] of registeredParts) {
        if (!part.IsDescendantOf(game)) {
            unregisterPart(part);
            continue;
        }
        setPartColorTween(part, flavor.colors[info.color]);
    }
})

function registerPart(part: Colorable) {
    const role = part.GetAttribute(COLOR_ROLE_ATTRIBUTE) as Label | undefined;
    if (!role) return;

    const color = flavorManager.getFlavor().colors[role];
    part.Color = color;
    registeredParts.set(part, {
        color: role,
        listeners: [
            part.GetAttributeChangedSignal(COLOR_ROLE_ATTRIBUTE).Connect(() => {
                const role = part.GetAttribute(COLOR_ROLE_ATTRIBUTE) as Label | undefined;
                if (!role) {
                    unregisterPart(part);
                    return;
                }
                const entry = registeredParts.get(part);
                if (!entry) return;
                entry.color = role;
                part.Color = flavorManager.getFlavor().colors[role];
            })
        ]
    });
}
function unregisterPart(part: Colorable) {
    const entry = registeredParts.get(part);
    if (!entry) return;
    entry.listeners.forEach(listener => listener.Disconnect());
    entry.listeners.clear();
    registeredParts.delete(part);
}
function setPartColorTween(part: Colorable, newColor: Color3) {
    const tween = TweenService.Create(
        part,
        new TweenInfo(EASE_DURATION, EASE_FUNCTION, EASE_DIRECTION),
        {
            Color: newColor
        }
    );
    tween.Play();
}

export function setPartColor(part: Colorable, color: Label | undefined) {
    if (color) {
        part.AddTag(THEMED_PART_TAG);
    }
    else {
        part.RemoveTag(THEMED_PART_TAG);
    }
    part.SetAttribute(COLOR_ROLE_ATTRIBUTE, color);
}

export function spawnVisualPalette(center: Vector3, elementSize: Vector3 = new Vector3(5, 25, 5), direction: Vector3 = new Vector3(0, 0, 1)): Folder {
    const folder = new Instance("Folder");
    folder.Name = "DebugVisualPalette";

    const length = labels.size() * elementSize.Z;
    for (let i = 0; i < labels.size(); i += 1) {
        const colorKey = labels[i];

        const part = new Instance("Part");
        part.Material = Enum.Material.Plastic;
        part.Size = elementSize;
        part.Name = colorKey;
        part.Anchored = true;
        part.Position = center.add(new Vector3(
            (i * elementSize.X - (length / 2)) * direction.X,
            (i * elementSize.Y - (length / 2)) * direction.Y,
            (i * elementSize.Z - (length / 2)) * direction.Z,
        ));

        setPartColor(part, colorKey);

        part.Parent = folder;
    }

    folder.Parent = Workspace;

    return folder;
}