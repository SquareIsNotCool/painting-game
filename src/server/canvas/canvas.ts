import { getRightAndDownVectorsFromNormalAcrossPrimaryAxis } from "shared/utils/vector";
import { CanvasElement } from "./canvasElement";
import { Players, RunService, Workspace } from "@rbxts/services";
import { $dbg } from "rbxts-transform-debug";
import { Brush, brushes, remotes as brushRemotes, selectableBrushes } from "../../shared/brushes";
import { CANVAS_FORWARD, CANVAS_TOP_LEFT, COOLDOWN_ATTRIBUTE, remotes } from "shared/canvas";
import { getUserData } from "server/userData";
import { BRUSH_DRYING_TIME } from "shared/constants";

const random = new Random();
export class Canvas {
    private pixels: CanvasElement[] = [];

    private forwards: Vector3;
    private right: Vector3;
    private down: Vector3;
    private center: Vector3;
    private size: Vector2;

    constructor(pixelsX: number, pixelsY: number, pixelWidth: number, pixelHeight: number, pixelNormal: Vector3, topLeft: Vector3) {
        const model = new Instance("Model");
        model.Name = "Canvas";

        const length = pixelsX * pixelsY;
        const { right, down } = getRightAndDownVectorsFromNormalAcrossPrimaryAxis(pixelNormal);

        this.forwards = pixelNormal;
        this.center = topLeft
            .add(right.mul((pixelWidth * pixelsX) / 2))
            .add(down.mul((pixelHeight * pixelsY) / 2));
        this.size = new Vector2(pixelsX * pixelWidth, pixelsY * pixelHeight);
        this.right = right;
        this.down = down;

        topLeft = topLeft.add(right.mul(pixelWidth/2)).add(down.mul(pixelHeight/2))

        $dbg(right);
        $dbg(down);
        $dbg(pixelNormal);
        const pixelSize = new Vector3(0, 0, 0)
            .add(right.mul(pixelWidth))
            .add(down.mul(pixelHeight))
            .add(pixelNormal.mul(0.15))
            .Abs();

        $dbg(pixelSize);
        
        for (let i = 0; i < length; i += 1) {
            const x = i % pixelsX;
            const y = pixelsY - 1 - math.floor(i / pixelsX);
            const position = topLeft
                .add(right.mul(pixelWidth * x))
                .add(down.mul(pixelHeight * y));
            const pixel = new CanvasElement(this, pixelSize, position, pixelNormal, brushes.blank, i, model);
            this.pixels.push(pixel);
        }

        model.Parent = Workspace;
    }

    public getUiCoords(): { bottomCenter: Vector3, forwards: Vector3 } {
        const bottomCenter = this.center
            .add(this.down.mul(this.size.Y * -0.5))
            .add(this.down.mul(-0.5));
        return {
            bottomCenter,
            forwards: this.forwards
        };
    }

    public areAnyDrying(): boolean {
        return this.pixels.some(x => x.drying);
    }

    public heartbeat() {
        for (const pixel of this.pixels) {
            if (pixel.getCurrentBrush().id === pixel.getDefaultBrush().id) continue;
            if (pixel.drying && random.NextNumber() < 0.01) {
                pixel.spawnSplashes(random.NextInteger(1, 2));
            }
            else if (!pixel.drying && pixel.getCurrentBrush().id !== pixel.getDefaultBrush().id && random.NextNumber() < 0.0001) {
                pixel.spawnSplashes(random.NextInteger(1, 2));
            }
        }
    }

    public getPixels() {
        return this.pixels as readonly CanvasElement[];
    }

    public paintEntireCanvas(brush: Brush, origin: Vector3) {
        for (const pixel of this.pixels) {
            task.spawn(() => {
                task.wait(origin.sub(pixel.getPosition()).Magnitude / 48 - 0.333);
                pixel.paint(brush, true);
            })
        }
    }
}

const RESOLUTION_MULTIPLIER = 1;
export const canvas = new Canvas(
    9 * RESOLUTION_MULTIPLIER,
    5 * RESOLUTION_MULTIPLIER,
    5 / RESOLUTION_MULTIPLIER,
    5 / RESOLUTION_MULTIPLIER,
    CANVAS_FORWARD,
    CANVAS_TOP_LEFT
);

RunService.Heartbeat.Connect((delta) => {
    canvas.heartbeat();

    for (const player of Players.GetPlayers()) {
        let cooldown = player.GetAttribute(COOLDOWN_ATTRIBUTE) as number;
        if (!typeIs(cooldown, "number")) cooldown = 0;
        cooldown = math.max(0, cooldown - delta);
        player.SetAttribute(COOLDOWN_ATTRIBUTE, cooldown);
    }
})

remotes.paintEntireCanvas.connect((player, brushId, origin) => {
    const brush = brushes[brushId];
    canvas.paintEntireCanvas(brush, origin);
})

remotes.paintPixel.connect((player, pixelId) => {
    const cooldown = player.GetAttribute(COOLDOWN_ATTRIBUTE);
    if (typeIs(cooldown, "number") && cooldown > 0) return;
    if (pixelId < 0 || pixelId > canvas.getPixels().size() - 1) return;
    const pixel = canvas.getPixels()[pixelId];

    if (pixel.drying) return;
    const userData = getUserData(player.UserId);
    const brush = brushes[userData.selectedBrush];
    pixel.paint(brush);

    player.SetAttribute(COOLDOWN_ATTRIBUTE, BRUSH_DRYING_TIME);
})