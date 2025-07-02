import { CollectionService, RunService, TweenService, Workspace } from "@rbxts/services";
import { Label, LabelWithInverse } from "shared/theme/catppuccin";
import { CAN_EASE_ATTRIBUTE, COLOR_ROLE_ATTRIBUTE, getPartLabel, setPartFlavoredColor, THEMED_PART_TAG } from "shared/theme/parts";
import { canvas } from "./canvas/canvas";
import { applyPaintToPart } from "shared/canvas";
import { createFolder } from "shared/utils/instance";
import { fract } from "shared/utils/math";
import { Brush, brushes } from "shared/brushes";
import { CanvasElement } from "./canvas/canvasElement";
import { $dbg } from "rbxts-transform-debug";

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
const lavaLampElementsFolder = createFolder("LavaLampElements", rootFolder);
const groundParts = [
    ...createOuterRing(new Vector3(0, 0, 0), 350, 35, "Base", outerRingFolder),
    ...createOuterRing(new Vector3(0, 0, 0), 500, 100, "Mantle", outerRingFolder),
    ...createOuterRing(new Vector3(0, 0, 0), 750, 250, "Crust", outerRingFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 250, 400, 200, 15, 35, ["Base", "Mantle"], innerCubesFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 150, 400, 200, 5, 25, ["Base", "Mantle"], innerCubesFolder),
    ...scatterCubesAroundInnerRegion(new Vector3(0, 0, 0), 100, 250, 50, 5, 10, ["Base"], innerCubesFolder),
];
const parts = [
    ...groundParts,  
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 1000, 150, 500, 25, 50, 50, ["Base", "Mantle", "Crust"], floatingCubesFolder),
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 350, 75, 150, 35, 50, 5, ["Base", "Mantle", "Crust"], floatingCubesFolder),
    ...scatterFloatingCubes(new Vector3(0, 0, 0), 1000, 150, 1000, 5, 15, 100, ["Base", "Mantle"], floatingCubesFolder)
];

function colorPart(part: Part, defaultLabel: LabelWithInverse | undefined, brush: Brush, isDefaultBrush: boolean, tween: boolean) {
    if (isDefaultBrush) {
        setPartFlavoredColor(part, defaultLabel, tween);
    }
    else applyPaintToPart(part, brush, tween);
}

const pixels = canvas.getPixels();
for (const pixel of pixels) {
    const count = random.NextInteger(2, 12);
    for (let i = 0; i < count; i += 1) {
        random.Shuffle(parts);
        const part = parts.pop();
        if (!part) continue;
        const defaultLabel = getPartLabel(part);
        pixel.dried.Connect((brush, isDefaultBrush) => {
            colorPart(part, defaultLabel, brush, isDefaultBrush, true);
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

    if (random.NextNumber() < 0.0025) {
        const lavaLampCount = random.NextInteger(1, 3);
        const availableParts = [...groundParts];
        for (let i = 0; i < lavaLampCount; i += 1) {
            const index = random.NextInteger(0, availableParts.size() - 1);
            const basePart = availableParts[index];
            availableParts[index] = availableParts[availableParts.size() - 1];
            availableParts.pop();

            const size = basePart.Size.X / 100;
    
            const part = basePart.Clone();
            part.Parent = lavaLampElementsFolder;

            part.Size = new Vector3(basePart.Size.X, basePart.Size.X, basePart.Size.Z);
            const heightDifference = basePart.Size.Y - part.Size.Y;
            part.Position = basePart.Position.add(basePart.CFrame.UpVector.mul(heightDifference * 0.5));

            const connections: RBXScriptConnection[] = [];
    
            connections.push(basePart.GetAttributeChangedSignal(CAN_EASE_ATTRIBUTE).Connect(() => {
                part.SetAttribute(CAN_EASE_ATTRIBUTE, basePart.GetAttribute(CAN_EASE_ATTRIBUTE));
            }))
            connections.push(basePart.GetAttributeChangedSignal(COLOR_ROLE_ATTRIBUTE).Connect(() => {
                part.SetAttribute(COLOR_ROLE_ATTRIBUTE, basePart.GetAttribute(COLOR_ROLE_ATTRIBUTE));
            }))
            connections.push(CollectionService.GetInstanceAddedSignal(THEMED_PART_TAG).Connect((instance) => {
                if (instance !== basePart) return;
                part.AddTag(THEMED_PART_TAG);
            }))
            connections.push(CollectionService.GetInstanceRemovedSignal(THEMED_PART_TAG).Connect((instance) => {
                if (instance !== basePart) return;
                part.RemoveTag(THEMED_PART_TAG);
            }))
    
            const tweenDuration = math.lerp(40, 200, size);
            const tween = TweenService.Create(
                part,
                new TweenInfo(tweenDuration, Enum.EasingStyle.Sine, Enum.EasingDirection.In),
                {
                    Position: part.Position.add(new Vector3(0, part.Size.X * 15, 0)),
                    Size: new Vector3(0, 0, 0),
                    Rotation: new Vector3(
                        math.lerp(-720, 720, random.NextNumber()),
                        math.lerp(-720, 720, random.NextNumber()),
                        math.lerp(-720, 720, random.NextNumber()),
                    )
                }
            );
            tween.Play();
            connections.push(tween.Completed.Connect(() => {
                for (const connection of connections) {
                    connection.Disconnect();
                }
                tween.Destroy();
                part.Destroy();
            }));
        }
    }
})