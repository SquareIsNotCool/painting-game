import { Workspace } from "@rbxts/services";
import { Brush, brushes, remotes, selectableBrushes } from "./brushes";
import { setPartFlavoredColor } from "./theme/parts";

export function applyPaintToPart(part: BasePart, brush: Brush, tween = true) {
    const material = brush.material ?? Enum.Material.Plastic;
    part.Material = material;

    if (material === Enum.Material.Plastic) {
        part.TopSurface = Enum.SurfaceType.Smooth;
        part.BottomSurface = Enum.SurfaceType.Smooth;
    }

    if (brush.color.type === "label") {
        setPartFlavoredColor(part, brush.color.label, tween);
    }
    else {
        setPartFlavoredColor(part, undefined);
        part.Color = brush.color.color;
    }
}

export function spawnTestBrushTriggers(center: Vector3, elementSize: Vector3, direction: Vector3, gap: number): Folder {
    const folder = new Instance("Folder");
    folder.Name = "DebugBrushButtons";

    const length = selectableBrushes.size() * (elementSize.Z * gap);
    for (let i = 0; i < selectableBrushes.size(); i += 1) {
        const brushId = selectableBrushes[i];
        const brush = brushes[brushId];

        const part = new Instance("Part");
        part.Anchored = true;
        part.Size = elementSize;
        part.Name = brush.name;
        
        applyPaintToPart(part, brush);

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
        proxmityPrompt.ActionText = `${brush.name} (${brushId})`;
        proxmityPrompt.ObjectText = "Set Brush";
        proxmityPrompt.KeyboardKeyCode = Enum.KeyCode.E;
        proxmityPrompt.GamepadKeyCode = Enum.KeyCode.ButtonX;
        proxmityPrompt.Exclusivity = Enum.ProximityPromptExclusivity.OnePerButton;
        proxmityPrompt.RequiresLineOfSight = true;
        proxmityPrompt.ClickablePrompt = true;
        proxmityPrompt.HoldDuration = 0;

        proxmityPrompt.Triggered.Connect(player => {
            remotes.setBrush(brushId);
        })

        proxmityPrompt.Parent = attachment;
        attachment.Parent = part;

        part.Parent = folder;
    }

    folder.Parent = Workspace;
    return folder;
}