import { Component, Element } from "@rbxts/roact";
import { Players, Workspace } from "@rbxts/services";
import { CANVAS_FORWARD, COOLDOWN_ATTRIBUTE, remotes } from "shared/canvas";
import { Tweened } from "shared/tweened";
import { getRightAndDownVectorsFromNormalAcrossPrimaryAxis } from "shared/utils/vector";
import Roact from "@rbxts/roact";
import { LabelWithInverse } from "shared/theme/catppuccin";
import { uiColorsChanged, getUiColor } from "shared/theme/ui";
import { averageCanvasColorChanged, getAverageCanvasColor } from "./canvasPixelColors";
import { getCurrentTrack, newTrack } from "./music/musicPlayer";
import { BRUSH_DRYING_TIME } from "shared/constants";

const localPlayer = Players.LocalPlayer;

const { right, down } = getRightAndDownVectorsFromNormalAcrossPrimaryAxis(CANVAS_FORWARD);

const uiPart = Workspace.WaitForChild("CooldownUiPart") as Part;
uiPart.Transparency = 1;

const uiOriginPosition = uiPart.Position;

const uiTransition = new Tweened(0, {
    time: 1,
    easingStyle: Enum.EasingStyle.Cubic,
    easingDirection: Enum.EasingDirection.Out
});

uiTransition.valueChanged.Connect(value => {
    uiPart.Position = uiOriginPosition.sub(new Vector3(0, (1 - value) * 5, 0));
    // uiPart.Transparency = 1 - value;
});

let showing = false;
let failedAttempts = 0;
localPlayer.GetAttributeChangedSignal(COOLDOWN_ATTRIBUTE).Connect(() => {
    const cooldown = localPlayer.GetAttribute(COOLDOWN_ATTRIBUTE) as number;
    const shouldShow = typeIs(cooldown, "number") && cooldown > 0.95 && failedAttempts >= 1;
    if (shouldShow !== showing) {
        showing = shouldShow;
        if (shouldShow) uiTransition.tween(1);
        else uiTransition.tween(0, { easingDirection: Enum.EasingDirection.In });
    }
    if (!typeIs(cooldown, "number") ||typeIs(cooldown, "number") && cooldown <= 0) {
        failedAttempts = 0;
    }
})

export function registerFailedPaintAttempt() {
    failedAttempts += 1;
}

class BrushCooldown extends Component<{ width: number, height: number }, { uiColorsChanged: boolean, progress: number, uiTransition: number }> {
    private connections!: RBXScriptConnection[];

    protected init() {
        this.setState({ uiColorsChanged: false, progress: 0, uiTransition: 0 });
    }

    protected didMount(): void {
        this.connections = [
            uiColorsChanged.Connect(() => {
                this.setState({ uiColorsChanged: true })
            }),
            averageCanvasColorChanged.Connect(() => {
                this.setState({ uiColorsChanged: true })
            }),
            localPlayer.GetAttributeChangedSignal(COOLDOWN_ATTRIBUTE).Connect(() => {
                const cooldown = localPlayer.GetAttribute(COOLDOWN_ATTRIBUTE) as number;
                const progress = 1 - (cooldown / BRUSH_DRYING_TIME);
                this.setState({ progress });
            }),
            uiTransition.valueChanged.Connect(value => {
                this.setState({ uiTransition: value })
            })
        ];
    }

    protected willUnmount(): void {
        for (const connection of this.connections) {
            connection.Disconnect();
        }
    }

    private color(label: LabelWithInverse) {
        return getUiColor(label);
    }

    public render() {
        const averageColor = getAverageCanvasColor();
        const baseColor = this.color("Crust").Lerp(averageColor, 0.3);
        const textColor = this.color("Text").Lerp(averageColor, 0.3);
        const padding = 0.05 * this.props.height;
        const paddedSize = new UDim2(0, this.props.width - padding * 2, 0, this.props.height - padding * 2);
        const borderColor = this.color("Base").Lerp(averageColor, 0.5);

        const text = "Please wait for paint to dry...";

        const transparency = 1 - this.state.uiTransition;

        return (<>
            <frame
                Size={new UDim2(1, 0, 1, 0)}
                BackgroundColor3={borderColor}
                BackgroundTransparency={transparency}
            >
                <uicorner
                    CornerRadius={new UDim(1, 0)}
                />
                <uipadding
                    PaddingBottom={new UDim(0, padding)}
                    PaddingTop={new UDim(0, padding)}
                    PaddingLeft={new UDim(0, padding)}
                    PaddingRight={new UDim(0, padding)}
                />
                <frame
                    Size={paddedSize}
                    BackgroundColor3={baseColor}
                    BackgroundTransparency={transparency}
                >
                    <uicorner
                        CornerRadius={new UDim(1, 0)}
                    />
                    <uigridlayout
                        CellSize={paddedSize}
                    />
                    <textlabel
                        Text={text}
                        Font={"SourceSansSemibold"}
                        TextScaled={true}
                        Size={paddedSize}
                        BackgroundTransparency={1}
                        TextColor3={textColor}
                        TextTransparency={transparency}
                    />
                </frame>
                <frame
                    Size={new UDim2(0, math.lerp(paddedSize.Height.Offset, paddedSize.Width.Offset, this.state.progress), 0, paddedSize.Height.Offset)}
                    BackgroundColor3={textColor}
                    BackgroundTransparency={transparency}
                    ZIndex={1}
                    ClipsDescendants={true}
                >
                    <uicorner
                        CornerRadius={new UDim(1, 0)}
                    />
                    <uigridlayout
                        CellSize={paddedSize}
                    />
                    <textlabel
                        Text={text}
                        Font={"SourceSansSemibold"}
                        TextScaled={true}
                        Size={paddedSize}
                        BackgroundTransparency={1}
                        TextColor3={baseColor}
                        TextTransparency={transparency}
                    />
                </frame>
            </frame>
        </>)
    }
}

const cooldownUi = <surfacegui
    Face={"Left"}
    PixelsPerStud={50}
    ClipsDescendants={true}
    ResetOnSpawn={false}
    CanvasSize={new Vector2(math.floor(uiPart.Size.Z * 50), math.floor(uiPart.Size.Y * 50))}
    MaxDistance={1000}
    LightInfluence={1}
>
    <BrushCooldown width={math.floor(uiPart.Size.Z * 50)} height={math.floor(uiPart.Size.Y * 50)} />
</surfacegui>;

Roact.mount(cooldownUi, uiPart);