import { CollectionService, RunService, TweenService, Workspace } from "@rbxts/services";
import { $print } from "rbxts-transform-debug";
import { flavors, Label, labels, LabelWithInverse, palettes } from "shared/theme/catppuccin";
import { flavorManager } from "./flavorManager";
import { TWEEN_INFO } from "./easing";

export const THEMED_PART_TAG = "FlavoredPart";
export const COLOR_ROLE_ATTRIBUTE = "ColorLabel";
export const CAN_EASE_ATTRIBUTE = "LabelChangeTransition";

interface PartInformation {
    color: LabelWithInverse,
    listeners: RBXScriptConnection[],
    tween: Tween | undefined,
    part: Colorable
}

type Colorable = BasePart;

const registeredParts: Map<Colorable, PartInformation> = new Map();

function setPartColorInstant(info: PartInformation, newColor: Color3) {
    if (RunService.IsServer()) return;
    info.part.Color = newColor;
    info.tween?.Cancel();
    info.tween = undefined;
}
function setPartColorTween(info: PartInformation, newColor: Color3) {
    if (RunService.IsServer()) return;
    const part = info.part;
    const tween = TweenService.Create(
        part,
        TWEEN_INFO,
        {
            Color: newColor
        }
    );
    info.tween?.Cancel();
    info.tween = tween;
    tween.Play();
}
function setPartColorWithEaseIfEnabled(info: PartInformation, newColor: Color3) {
    const shouldTween = info.part.GetAttribute(CAN_EASE_ATTRIBUTE) === true;
    if (shouldTween) {
        setPartColorTween(info, newColor);
    }
    else {
        setPartColorInstant(info, newColor);
    }
}

function unregisterPart(part: Colorable) {
    const entry = registeredParts.get(part);
    if (!entry) return;
    entry.tween?.Cancel();
    entry.tween = undefined;
    entry.listeners.forEach(listener => listener.Disconnect());
    entry.listeners.clear();
    registeredParts.delete(part);
}
function registerPart(part: Colorable) {
    const role = part.GetAttribute(COLOR_ROLE_ATTRIBUTE) as LabelWithInverse | undefined;
    if (!role) return;

    const color = flavorManager.getColor(role);
    const partInfo: PartInformation = {
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
                const color = flavorManager.getColor(role);
                setPartColorWithEaseIfEnabled(entry, color);
            })
        ],
        tween: undefined,
        part
    };
    setPartColorWithEaseIfEnabled(partInfo, color);
    registeredParts.set(part, partInfo);
}
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
    unregisterPart(part);
})
$print("Ready!");

flavorManager.changed.Connect((flavor, skipTween) => {
    for (const [part, info] of registeredParts) {
        if (!part.IsDescendantOf(game)) {
            unregisterPart(part);
            continue;
        }
        const color = flavorManager.getColor(info.color);
        if (skipTween) {
            setPartColorInstant(info, color);
        }
        else {
            setPartColorTween(info, color);
        }
    }
})

export function setPartFlavoredColor(part: Colorable, label: LabelWithInverse | undefined, tween = false) {
    part.SetAttribute(CAN_EASE_ATTRIBUTE, tween);
    if (label) {
        part.AddTag(THEMED_PART_TAG);
    }
    else {
        part.RemoveTag(THEMED_PART_TAG);
    }
    part.SetAttribute(COLOR_ROLE_ATTRIBUTE, label);
}

export function spawnVisualPalette(inverse: boolean, center: Vector3, elementSize: Vector3 = new Vector3(5, 25, 5), direction: Vector3 = new Vector3(0, 0, 1)): Folder {
    const folder = new Instance("Folder");
    folder.Name = "DebugVisualPalette";

    const length = labels.size() * elementSize.Z;
    for (let i = 0; i < labels.size(); i += 1) {
        let colorKey: LabelWithInverse = labels[i];
        if (inverse) colorKey = `Inverse${colorKey}`;

        const part = new Instance("Part");
        part.Material = Enum.Material.Plastic;
        part.TopSurface = Enum.SurfaceType.Smooth;
        part.BottomSurface = Enum.SurfaceType.Smooth;
        part.Size = elementSize;
        part.Name = colorKey;
        part.Anchored = true;
        part.Position = center.add(new Vector3(
            (i * elementSize.X - (length / 2)) * direction.X,
            (i * elementSize.Y - (length / 2)) * direction.Y,
            (i * elementSize.Z - (length / 2)) * direction.Z,
        ));

        setPartFlavoredColor(part, colorKey);

        part.Parent = folder;
    }

    folder.Parent = Workspace;

    return folder;
}

export function spawnTestFlavorTriggers(center: Vector3, elementSize: Vector3, direction: Vector3, gap: number): Folder {
    const folder = new Instance("Folder");
    folder.Name = "DebugFlavorButtons";

    const length = flavors.size() * (elementSize.Z * gap);
    for (let i = 0; i < flavors.size(); i += 1) {
        const flavor = flavors[i];
        const flavorInfo = palettes[flavor];

        const part = new Instance("Part");
        part.Anchored = true;
        part.Color = flavorInfo.colors.Surface0;
        part.Size = elementSize;
        part.Name = flavor;
        part.Material = Enum.Material.Plastic;
        part.TopSurface = Enum.SurfaceType.Smooth;
        part.BottomSurface = Enum.SurfaceType.Smooth;

        part.Position = center.add(new Vector3(
            (i * (elementSize.X * gap) - (length / 2)) * direction.X,
            (i * (elementSize.Y * gap) - (length / 2)) * direction.Y,
            (i * (elementSize.Z * gap) - (length / 2)) * direction.Z,
        )).add(new Vector3(
            gap * direction.X,
            gap * direction.Y,
            gap * direction.Z
        ));

        const attachment = new Instance("Attachment");

        const proxmityPrompt = new Instance("ProximityPrompt");
        proxmityPrompt.ActionText = `${flavorInfo.emoji} ${flavorInfo.name}`;
        proxmityPrompt.ObjectText = "Set Flavor";
        proxmityPrompt.KeyboardKeyCode = Enum.KeyCode.E;
        proxmityPrompt.GamepadKeyCode = Enum.KeyCode.ButtonX;
        proxmityPrompt.Exclusivity = Enum.ProximityPromptExclusivity.OnePerButton;
        proxmityPrompt.RequiresLineOfSight = true;
        proxmityPrompt.ClickablePrompt = true;
        proxmityPrompt.HoldDuration = 0;

        proxmityPrompt.Triggered.Connect(player => {
            flavorManager.setFlavor(flavor);
        })

        proxmityPrompt.Parent = attachment;
        attachment.Parent = part;

        part.Parent = folder;
    }

    folder.Parent = Workspace;
    return folder;
}

export function getPartLabel(part: BasePart): LabelWithInverse | undefined {
    if (!part.HasTag(THEMED_PART_TAG)) return undefined;
    return part.GetAttribute(COLOR_ROLE_ATTRIBUTE) as LabelWithInverse;
}