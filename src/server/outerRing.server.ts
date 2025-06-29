import { Workspace } from "@rbxts/services";
import { Label } from "shared/theme/catppuccin";
import { setPartFlavoredColor } from "shared/theme/parts";
import { canvas } from "./canvas/canvas";
import { applyPaintToPart } from "shared/canvas";

const random = new Random();
function createRing(center: Vector3, distance: number, cubeSize: number, label: Label, parent: Instance = Workspace): Part[] {
    const arc = math.asin((cubeSize * 0.8) / (2 * distance));
    const count = math.floor(math.pi / arc);
    const angleStep = (2 * math.pi) / count;

    const folder = new Instance("Folder");
    folder.Name = "CubeRing";

    const parts: Part[] = [];
    for (let i = 0; i < count; i += 1) {
        const angle = i * angleStep;
        const x = center.X + math.cos(angle) * distance;
        const z = center.Z + math.sin(angle) * distance;
        const position = new Vector3(x, center.Y + math.lerp(-cubeSize * 0.5, cubeSize * 0.5, random.NextNumber()), z);

        const cube = new Instance("Part");
        cube.Size = new Vector3(cubeSize, cubeSize * 2, cubeSize);
        cube.Position = position;
        cube.Anchored = true;
        cube.TopSurface = Enum.SurfaceType.Smooth;
        cube.BottomSurface = Enum.SurfaceType.Smooth;

        parts.push(cube);

        setPartFlavoredColor(cube, label, false);
        
        cube.CFrame = new CFrame(position, center);
        cube.Rotation = cube.Rotation.add(new Vector3(
            math.lerp(-25, 25, random.NextNumber()),
            math.lerp(-25, 25, random.NextNumber()),
            math.lerp(-25, 25, random.NextNumber())
        ))

        cube.Parent = folder;
    }

    folder.Parent = parent;

    return parts;
}

const folder = new Instance("Folder");
folder.Name = "Background";
folder.Parent = Workspace;
const parts = [
    ...createRing(new Vector3(0, 0, 0), 350, 35, "Base", folder),
    ...createRing(new Vector3(0, 0, 0), 500, 100, "Mantle", folder),
    ...createRing(new Vector3(0, 0, 0), 750, 250, "Crust", folder)
];

const pixels = canvas.getPixels();
for (const pixel of pixels) {
    const count = random.NextInteger(0, 3);
    for (let i = 0; i < count; i += 1) {
        random.Shuffle(parts);
        const part = parts.pop();
        if (!part) continue;
        pixel.dried.Connect((brush) => {
            applyPaintToPart(part, brush, true);
        })
    }
}
// createRing(new Vector3(0, 0, 0), 100, 25);