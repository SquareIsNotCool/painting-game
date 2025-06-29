import { Players, RunService, Workspace } from "@rbxts/services";
import { $print } from "rbxts-transform-debug";
import { baseplate } from "shared/baseplate";
import { Brush, BRUSH_ID_ATTRIBUTE, brushes, BrushId } from "shared/brushes";
import { applyPaintToPart } from "shared/canvas";
import { remotes } from "shared/splashes";
import { setPartFlavoredColor } from "shared/theme/parts";
import { easeOutExpo } from "shared/utils/easing";

interface FallingDripInstance {
    size: number,
    lifetime: number,
    brush: Brush,
    part: Part,
    hasCreatedSplash: boolean
}
interface LandedDripInstance {
    size: number,
    lifetime: number,
    brush: Brush,
    part: Part
}

const DRIP_LENGTH = 2;
const SPLASH_THICKNESS = 0.025;
const SPLASH_LIFETIME = 15;
const SPLASH_FADE_OUT_TIME = 0.5;
const SPLASH_SIZE_MIN = 0.35;
const SPLASH_SIZE_MAX = 0.75;

const fallingDrips = new Set<FallingDripInstance>();
const landedDrips = new Set<LandedDripInstance>();

const rootFolder = new Instance("Folder");
rootFolder.Name = "PaintDrips";
rootFolder.Parent = Workspace;

const fallingDripsFolder = new Instance("Folder");
fallingDripsFolder.Name = "Falling";
fallingDripsFolder.Parent = rootFolder;

const landedDripsFolder = new Instance("Folder");
landedDripsFolder.Name = "Landed";
landedDripsFolder.Parent = rootFolder;

const random = new Random();
function spawnSplash(position: Vector3, brush: Brush, name: string) {
    const size = math.lerp(SPLASH_SIZE_MIN, SPLASH_SIZE_MAX, random.NextNumber())

    const part = new Instance("Part");
    part.Name = name;
    part.Shape = Enum.PartType.Cylinder;
    part.CFrame = new CFrame(position).mul(CFrame.fromEulerAngles(0, 0, math.rad(90)));
    part.Anchored = true;
    part.CanCollide = false;
    applyPaintToPart(part, brush, false);

    fallingDrips.add({
        brush,
        lifetime: 0,
        part,
        size,
        hasCreatedSplash: false
    });

    part.Parent = fallingDripsFolder;
}
function spawnSplashesOnPlayer(player: Player, count: number) {
    for (let i = 0; i < count; i += 1) {
        const brushId = player.GetAttribute(BRUSH_ID_ATTRIBUTE);
        if (!brushId) continue;
        const brush = brushes[brushId as BrushId];

        const character = player.Character;
        if (!character) return;
        const [boundingFrame, boundingSize] = character.GetBoundingBox();
        const tl = boundingFrame.Position.add(boundingSize.div(2));
        const br = boundingFrame.Position.sub(boundingSize.div(2).div(new Vector3(1, 2, 1)));

        const position = new Vector3(
            math.lerp(tl.X, br.X, random.NextNumber()),
            math.lerp(tl.Y, br.Y, random.NextNumber()),
            math.lerp(tl.Z, br.Z, random.NextNumber()),
        );
        spawnSplash(position, brush, `${player.Name} - ${brush.name}`);
    }
}

remotes.spawnSplashes.connect(splashes => {
    for (const splash of splashes) {
        const brush = brushes[splash.brush];
        spawnSplash(splash.position, brush, `Server - ${brush.name}`);
    }
})
remotes.spawnSplashesOnPlayer.connect((targetPlayerId, count) => {
    const targetPlayer = Players.GetPlayerByUserId(targetPlayerId);
    if (!targetPlayer) return;
    spawnSplashesOnPlayer(targetPlayer, count);
})

RunService.Heartbeat.Connect(delta => {
    for (const player of Players.GetPlayers()) {
        const state = player.Character?.FindFirstChildOfClass("Humanoid")?.GetState();
        if (state === Enum.HumanoidStateType.Landed) {
            spawnSplashesOnPlayer(player, 2);
            continue;
        }
        if (random.NextNumber() > 0.01) continue;
        spawnSplashesOnPlayer(player, 1);
    }

    const floor = baseplate.Position.Y + baseplate.Size.Y / 2;
    for (const dripInstance of fallingDrips) {
        dripInstance.lifetime = math.min(1, dripInstance.lifetime + delta * 10);
        const size = dripInstance.size;
        const part = dripInstance.part;
        part.Size = new Vector3(dripInstance.lifetime * DRIP_LENGTH, size * dripInstance.lifetime, size * dripInstance.lifetime);
        part.Position = part.Position.sub(new Vector3(0, delta * 50, 0));

        const bottom = part.Position.Y - part.Size.Y / 2;
        const top = part.Position.Y + part.Size.Y / 2;

        if (!dripInstance.hasCreatedSplash && bottom <= floor) {
            dripInstance.hasCreatedSplash = true;
        }
        if (top <= floor) {
            const position = new Vector3(part.Position.X, 0, part.Position.Z);
            const name = part.Name;

            part.Destroy();
            fallingDrips.delete(dripInstance);

            const splashPart = new Instance("Part");
            splashPart.Name = name;
            splashPart.Shape = Enum.PartType.Cylinder;
            splashPart.CFrame = new CFrame(position).mul(CFrame.fromEulerAngles(0, 0, math.rad(90)));
            splashPart.Anchored = true;
            splashPart.CanCollide = false;
            applyPaintToPart(splashPart, dripInstance.brush, false);

            landedDrips.add({
                brush: dripInstance.brush,
                lifetime: 0,
                part: splashPart,
                size
            })

            splashPart.Parent = landedDripsFolder;
        }
    }

    for (const splashInstance of landedDrips) {
        const { part, size } = splashInstance;
        splashInstance.lifetime += delta;
        const grow = easeOutExpo(math.min(1, splashInstance.lifetime * 5));
        const life = math.min(SPLASH_LIFETIME, splashInstance.lifetime);
        const easeOut = math.min(SPLASH_FADE_OUT_TIME, SPLASH_LIFETIME - life) / SPLASH_FADE_OUT_TIME;

        if (life >= SPLASH_LIFETIME) {
            part.Destroy();
            landedDrips.delete(splashInstance);
            continue;
        }

        part.Size = new Vector3(SPLASH_THICKNESS, size * 7 * grow, size * 7 * grow);
        part.Position = new Vector3(part.Position.X, floor + math.lerp(SPLASH_THICKNESS / 2, (SPLASH_THICKNESS / 2) * -0.9, life / SPLASH_LIFETIME), part.Position.Z);
        part.Transparency = 1 - easeOut;
    }
})