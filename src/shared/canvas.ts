import { RunService, Workspace } from "@rbxts/services";
import { Brush, brushes, BrushId, remotes, selectableBrushes } from "./brushes";
import { setPartFlavoredColor } from "./theme/parts";
import { createRemotes, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";

export const testRemotes = createRemotes({
    paintEntireCanvas: remote<Server, [brush: BrushId, origin: Vector3]>(t.keyOf(brushes), t.Vector3)
});

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

        const setBrushAttachment = new Instance("Attachment");
        setBrushAttachment.Position = setBrushAttachment.Position.add(new Vector3(0, 1.25, 0));
        const setBrushPrompt = new Instance("ProximityPrompt");
        setBrushPrompt.ActionText = `${brush.name} (${brushId})`;
        setBrushPrompt.ObjectText = "Set Brush";
        setBrushPrompt.KeyboardKeyCode = Enum.KeyCode.E;
        setBrushPrompt.GamepadKeyCode = Enum.KeyCode.ButtonX;
        setBrushPrompt.Exclusivity = Enum.ProximityPromptExclusivity.OnePerButton;
        setBrushPrompt.RequiresLineOfSight = true;
        setBrushPrompt.ClickablePrompt = true;
        setBrushPrompt.HoldDuration = 0;

        setBrushPrompt.Triggered.Connect(player => {
            remotes.setBrush(brushId);
        })
        setBrushPrompt.Parent = setBrushAttachment;
        setBrushAttachment.Parent = part;

        const fillCanvasAttachment = new Instance("Attachment");
        fillCanvasAttachment.Position = fillCanvasAttachment.Position.sub(new Vector3(0, 2.25, 0));
        const fillCanvasPrompt = new Instance("ProximityPrompt");
        fillCanvasPrompt.ActionText = `${brush.name} (${brushId})`;
        fillCanvasPrompt.ObjectText = "Fill Canvas";
        fillCanvasPrompt.KeyboardKeyCode = Enum.KeyCode.F;
        fillCanvasPrompt.GamepadKeyCode = Enum.KeyCode.ButtonY;
        fillCanvasPrompt.Exclusivity = Enum.ProximityPromptExclusivity.OnePerButton;
        fillCanvasPrompt.RequiresLineOfSight = true;
        fillCanvasPrompt.ClickablePrompt = false;
        fillCanvasPrompt.HoldDuration = 2;

        fillCanvasPrompt.Triggered.Connect(player => {
            if (RunService.IsClient()) {
                testRemotes.paintEntireCanvas.fire(brushId, part.Position);
            }
        })
        fillCanvasPrompt.Parent = fillCanvasAttachment;
        fillCanvasAttachment.Parent = part;

        part.Parent = folder;
    }

    folder.Parent = Workspace;
    return folder;
}