import { RunService, Workspace } from "@rbxts/services";
import { Label, LabelWithInverse } from "shared/theme/catppuccin";
import { getPartLabel, setPartFlavoredColor } from "shared/theme/parts";
import { canvas } from "./canvas/canvas";
import { applyPaintToPart } from "shared/canvas";
import { createFolder } from "shared/utils/instance";
import { fract } from "shared/utils/math";

const random = new Random();

function createOuterRing(center: Vector3, distance: number, cubeSize: number, label: LabelWithInverse, parent: Instance = Workspace): Part[] {
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

function scatterCubesAroundInnerRegion(center: Vector3, innerDistance: number, outerDistance: number, count: number, cubeSizeMin: number, cubeSizeMax: number, labels: LabelWithInverse[], parent: Instance): Part[] {
    const parts: Part[] = [];

    for (let i = 0; i < count; i += 1) {
        const angle = math.rad(random.NextNumber() * 360);
        const radius = math.lerp(innerDistance, outerDistance, random.NextNumber());
        const cubeSize = math.lerp(cubeSizeMin, cubeSizeMax, random.NextNumber());

        const x = center.X + radius * math.cos(angle)
        const z = center.Z + radius * math.sin(angle)

        const position = new Vector3(x, center.Y + math.lerp(-cubeSize * 0.5, cubeSize * 0.5, random.NextNumber()), z);
        const label = labels[random.NextInteger(0, labels.size() - 1)]

        const cube = new Instance("Part");
        cube.Size = new Vector3(cubeSize, cubeSize * 2, cubeSize);
        cube.Anchored = true;
        cube.TopSurface = Enum.SurfaceType.Smooth;
        cube.BottomSurface = Enum.SurfaceType.Smooth;

        parts.push(cube);

        setPartFlavoredColor(cube, label, false);
        
        cube.CFrame = new CFrame(position.sub(new Vector3(0, cubeSize * 0.1, 0))).mul(CFrame.fromEulerAngles(
            math.rad(math.lerp(-25, 25, random.NextNumber())),
            math.rad(math.lerp(-25, 25, random.NextNumber())),
            math.rad(math.lerp(-25, 25, random.NextNumber()))
        ));

        cube.Parent = parent;
    }

    return parts;
}

interface FloatingCube {
    part: Part,
    speed: number,
    frame: CFrame,
    angle: number,
    spin: number,
    float: number
}
// [spin, orient, 0]
const floatingCubes: FloatingCube[] = [];
function scatterFloatingCubes(center: Vector3, outerDistance: number, minHeight: number, maxHeight: number, minSize: number, maxSize: number, count: number, labels: LabelWithInverse[], parent: Instance): Part[] {
const parts: Part[] = [];

    for (let i = 0; i < count; i += 1) {
        const angle = math.rad(random.NextNumber() * 360);
        const radius = math.lerp(0, outerDistance, random.NextNumber());
        const sizeAndSpeed = random.NextNumber();
        const cubeSize = math.lerp(maxSize, minSize, sizeAndSpeed);

        const x = center.X + radius * math.cos(angle)
        const z = center.Z + radius * math.sin(angle)
        const y = center.Y + math.lerp(minHeight, maxHeight, random.NextNumber())

        const position = new Vector3(x, y, z);
        const label = labels[random.NextInteger(0, labels.size() - 1)]

        const cube = new Instance("Part");
        cube.Size = new Vector3(cubeSize, cubeSize, cubeSize);
        cube.Anchored = true;
        cube.TopSurface = Enum.SurfaceType.Smooth;
        cube.BottomSurface = Enum.SurfaceType.Smooth;

        parts.push(cube);

        setPartFlavoredColor(cube, label, false);

        const floatingCube: FloatingCube = {
            part: cube,
            speed: sizeAndSpeed,
            frame: new CFrame(position).mul(CFrame.fromEulerAngles(
                math.rad(math.lerp(-25, 25, random.NextNumber())),
                math.rad(math.lerp(-25, 25, random.NextNumber())),
                math.rad(math.lerp(-25, 25, random.NextNumber()))
            )),
            angle: math.rad(random.NextNumber() * 360),
            spin: 0,
            float: 0
        };
        floatingCubes.push(floatingCube);
        
        cube.CFrame = floatingCube.frame;

        cube.Parent = parent;
    }

    return parts;
}

const rootFolder = createFolder("Environment", Workspace);
const outerRingFolder = createFolder("OuterRings", rootFolder);
const innerCubesFolder = createFolder("InnerCubes", rootFolder);
const floatingCubesFolder = createFolder("FloatingCubes", rootFolder);
const parts = [
    ...createOuterRing(new Vector3(0, 0, 0), 350, 35, "Base", outerRingFolder),
    ...createOuterRing(new Vector3(0, 0, 0), 500, 100, "Mantle", outerRingFolder),
    ...createOuterRing(new Vector3(0, 0, 0), 750, 250, "Crust", outerRingFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 250, 400, 200, 15, 35, ["Base", "Mantle"], innerCubesFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 150, 400, 200, 5, 25, ["Base", "Mantle"], innerCubesFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 100, 250, 50, 5, 10, ["Base"], innerCubesFolder),
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 1000, 150, 500, 25, 50, 50, ["Base", "Mantle", "Crust"], floatingCubesFolder),
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 350, 75, 150, 35, 50, 5, ["Base", "Mantle", "Crust"], floatingCubesFolder),
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 1000, 150, 1000, 5, 15, 100, ["Base", "Mantle"], floatingCubesFolder)
];

const pixels = canvas.getPixels();
for (const pixel of pixels) {
    const count = random.NextInteger(0, 10);
    for (let i = 0; i < count; i += 1) {
        random.Shuffle(parts);
        const part = parts.pop();
        if (!part) continue;
        const defaultLabel = getPartLabel(part);
        pixel.dried.Connect((brush, idDefaultBrush) => {
            if (idDefaultBrush) {
                setPartFlavoredColor(part, defaultLabel, true);
            }
            else applyPaintToPart(part, brush, true);
        })
    }
}

RunService.Heartbeat.Connect(delta => {
    for (const cube of floatingCubes) {
        const spinSpeed = math.lerp(0.01, 0.05, cube.speed);
        const floatSpeed = math.lerp(0.01, 0.1, cube.speed);
        const floatLength = math.lerp(1, 10, cube.speed);

        cube.spin = fract(cube.spin + delta * cube.speed * spinSpeed);
        cube.float = fract(cube.float + delta * cube.speed * floatSpeed);

        const part = cube.part;
        part.CFrame = cube.frame;
        part.Position = part.Position.add(new Vector3(0, math.sin(math.rad(cube.float * 360)) * floatLength));
        part.CFrame = part.CFrame.mul(CFrame.fromEulerAngles(math.rad(cube.spin * 360), cube.angle, 0, Enum.RotationOrder.YXZ));
    }
})