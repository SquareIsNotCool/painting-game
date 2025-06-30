import { getRightAndDownVectorsFromNormalAcrossPrimaryAxis } from "shared/utils/vector";
import { CanvasElement } from "./canvasElement";
import { RunService, Workspace } from "@rbxts/services";
import { $dbg } from "rbxts-transform-debug";
import { Brush, brushes, remotes, selectableBrushes } from "../../shared/brushes";
import { testRemotes } from "shared/canvas";

const random = new Random();
export class Canvas {
    private pixels: CanvasElement[] = [];

    constructor(pixelsX: number, pixelsY: number, pixelWidth: number, pixelHeight: number, pixelNormal: Vector3, topLeft: Vector3) {
        const model = new Instance("Model");
        model.Name = "Canvas";

        const length = pixelsX * pixelsY;
        const { right, down } = getRightAndDownVectorsFromNormalAcrossPrimaryAxis(pixelNormal);
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
    new Vector3(-1, 0, 0), new Vector3(37.425, 24.5 + 2.5, -20 - 2.5)
);

RunService.Heartbeat.Connect(() => {
    canvas.heartbeat();
})

testRemotes.paintEntireCanvas.connect((player, brushId, origin) => {
    const brush = brushes[brushId];
    canvas.paintEntireCanvas(brush, origin);
})