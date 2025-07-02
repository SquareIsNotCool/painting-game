import { setPartFlavoredColor } from "shared/theme/parts";
import { Brush, brushes } from "../../shared/brushes";
import { TweenService } from "@rbxts/services";
import { $print } from "rbxts-transform-debug";
import { getRightAndDownVectorsFromNormalAcrossPrimaryAxis } from "shared/utils/vector";
import { getUserData } from "server/userData";
import { applyPaintToPart } from "shared/canvas";
import type { Canvas } from "./canvas";
import { remotes, SpawnSplash } from "shared/splashes";

const PAINT_LAYER_DEPTH = 0.01;
const DRYING_DURATION = 30/5;

export const ID_ATTRIBUTE = "CanvasPixelIdent";

const random = new Random();
export class CanvasElement {
    public readonly id: number;
    private currentBrush: Brush;
    private defaultBrush: Brush;
    public drying: boolean = false;
    private finishedDryingEvent: BindableEvent<(brush: Brush, defaultBrush: boolean) => void>;
    public dried: RBXScriptSignal<(brush: Brush, defaultBrush: boolean) => void>;

    private baseLayer: Part;
    private paintLayer: Part;

    private size: Vector3;
    private position: Vector3;
    private paintLayerSize: Vector3;

    private paintFace: Vector3;
    private down: Vector3;
    private right: Vector3;

    public getCurrentBrush() {
        return this.currentBrush;
    }
    public getDefaultBrush() {
        return this.defaultBrush;
    }
    public getPosition() {
        return this.baseLayer.Position;
    }

    private tweens = {
        sizeTween: undefined as unknown as Tween,
        transparencyTween: undefined as unknown as Tween,
        connections: [] as RBXScriptConnection[]
    }

    private hidePaintLayer() {
        this.paintLayer.Transparency = 1;
        this.paintLayer.CFrame = new CFrame(this.position.add(this.paintFace.mul(PAINT_LAYER_DEPTH * -2)));
    }

    private createTweens() {
        this.tweens.connections.forEach(x => x.Disconnect());
        this.tweens.connections.clear();

        this.tweens.sizeTween?.Destroy();
        this.tweens.transparencyTween?.Destroy();

        this.tweens.sizeTween = TweenService.Create(
            this.paintLayer,
            new TweenInfo(
                DRYING_DURATION,
                Enum.EasingStyle.Exponential,
                Enum.EasingDirection.In
            ),
            {
                Size: this.size,
                Position: this.position
            }
        );
        this.tweens.transparencyTween = TweenService.Create(
            this.paintLayer,
            new TweenInfo(
                DRYING_DURATION * 0.55,
                Enum.EasingStyle.Quad,
                Enum.EasingDirection.Out
            ),
            {
                Transparency: 0
            }
        );

        this.tweens.connections.push(this.tweens.sizeTween.Completed.Connect((state) => {
            $print("SizeTween completed!");
            this.drying = false;
            applyPaintToPart(this.baseLayer, this.currentBrush);
            this.hidePaintLayer();
            if (state === Enum.PlaybackState.Completed) this.finishedDryingEvent.Fire(this.currentBrush, this.currentBrush.id === this.defaultBrush.id);
        }))
        this.tweens.connections.push(this.tweens.transparencyTween.Completed.Connect((state) => {
            $print("TransparencyTween completed!");
            if (state === Enum.PlaybackState.Completed) applyPaintToPart(this.baseLayer, this.currentBrush);
        }))
    }

    paint(brush: Brush, force = false) {
        if (this.drying && !force) return;
        $print("Painting!");
        this.drying = true;

        this.tweens.sizeTween?.Cancel();
        this.tweens.transparencyTween?.Cancel();

        this.paintLayer.Transparency = 1;
        applyPaintToPart(this.baseLayer, this.currentBrush);
        applyPaintToPart(this.paintLayer, brush);
        this.paintLayer.Transparency = 1;
        this.currentBrush = brush;

        this.paintLayer.Size = this.paintLayerSize;
        this.paintLayer.CFrame = new CFrame(this.position.add(this.paintFace.mul(PAINT_LAYER_DEPTH / 2)).add(this.size.mul(this.paintFace).mul(0.5)));

        this.createTweens();
        this.tweens.sizeTween.Play();
        this.tweens.transparencyTween.Play();
        if (brush.id !== this.defaultBrush.id) this.spawnSplashes(random.NextInteger(3, 5));
    }
    reset() {
        this.tweens.sizeTween.Cancel();
        this.tweens.transparencyTween.Cancel();

        applyPaintToPart(this.baseLayer, this.defaultBrush);
        this.hidePaintLayer();
    }
    spawnSplashes(count: number) {
        const tl = this.position
            .add(
                this.down
                    .mul(this.size)
                    .add(this.right.mul(this.size.div(2).mul(0.9)))
                    .mul(-1)
                    .add(this.paintFace.mul(PAINT_LAYER_DEPTH / 2))
            );
        const br = this.position
            .add(
                this.down
                    .mul(this.size)
                    .add(this.right.mul(this.size.div(2).mul(0.9)))
                    .add(this.paintFace.mul(PAINT_LAYER_DEPTH / 2))
            );

        const splashes: SpawnSplash[] = [];
        for (let i = 0; i < count; i += 1) {
            splashes.push({
                brush: this.currentBrush.id,
                position: new Vector3(
                    math.lerp(tl.X, br.X, random.NextNumber()),
                    math.lerp(tl.Y, br.Y, random.NextNumber()),
                    math.lerp(tl.Z, br.Z, random.NextNumber()),
                ).add(this.paintFace.mul(math.lerp(0.1, 0.2, random.NextNumber())))
            });
        }
        remotes.spawnSplashes.fireAll(splashes);
    }

    constructor(canvas: Canvas, size: Vector3, position: Vector3, paintFace: Vector3, defaultBrush: Brush, id: number, parent: Instance) {
        this.id = id;
        this.currentBrush = defaultBrush;
        this.position = position;
        this.size = size;
        this.defaultBrush = defaultBrush;

        this.finishedDryingEvent = new Instance("BindableEvent");
        this.dried = this.finishedDryingEvent.Event;

        const { down, right } = getRightAndDownVectorsFromNormalAcrossPrimaryAxis(paintFace);
        this.paintLayerSize = size.mul(down.add(right).Abs()).add(paintFace.mul(PAINT_LAYER_DEPTH).Abs());

        this.paintFace = paintFace;
        this.down = down;
        this.right = right;

        const model = new Instance("Model");
        model.Name = "CanvasPixel";

        const baseLayer = new Instance("Part");
        baseLayer.Anchored = true;
        baseLayer.Name = "BaseLayer";
        baseLayer.Size = size;
        baseLayer.Position = position;

        baseLayer.SetAttribute(ID_ATTRIBUTE, id);

        const paintLayer = new Instance("Part");
        paintLayer.Anchored = true;
        paintLayer.Name = "PaintLayer";
        paintLayer.Transparency = 1;
        paintLayer.Size = size;
        paintLayer.Position = position;

        this.baseLayer = baseLayer;
        this.paintLayer = paintLayer;

        const clickDetector = new Instance("ClickDetector");
        clickDetector.Parent = baseLayer;

        applyPaintToPart(baseLayer, defaultBrush, false);

        baseLayer.Parent = model;
        paintLayer.Parent = model;
        model.Parent = parent;

        this.hidePaintLayer();

        clickDetector.MouseClick.Connect((player) => {
            if (this.drying) return;
            // if (canvas.areAnyDrying()) return;
            const userData = getUserData(player.UserId);
            const brush = brushes[userData.selectedBrush];
            $print(userData.selectedBrush);
            this.paint(brush);
        })
    }
}