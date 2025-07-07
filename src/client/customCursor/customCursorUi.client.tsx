import Roact, { Component, Element } from "@rbxts/roact";
import { Cursor, cursorChanged, getCurrentCursor } from "./customCursor";
import { averageCanvasColorChanged } from "client/canvasPixelColors";
import { COOLDOWN_ATTRIBUTE } from "shared/canvas";
import { BRUSH_DRYING_TIME } from "shared/constants";
import { LabelWithInverse } from "shared/theme/catppuccin";
import { uiColorsChanged, getUiColor } from "shared/theme/ui";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { BRUSH_ID_ATTRIBUTE, getPlayerBrush } from "shared/brushes";
import { spawnParticle } from "client/screenspaceParticles";
import { $dbg, $print } from "rbxts-transform-debug";

const player = Players.LocalPlayer;

class CustomCursor extends Component<{ cursorSize: number }, { cursorLocation: Vector2, cursor: Cursor, uiColorsChanged: boolean }> {
    private connections!: RBXScriptConnection[];

    protected init() {
        this.setState({ uiColorsChanged: false, cursorLocation: UserInputService.GetMouseLocation(), cursor: getCurrentCursor() });
    }

    protected didMount(): void {
        this.connections = [
            uiColorsChanged.Connect(() => {
                this.setState({ uiColorsChanged: true });
            }),
            cursorChanged.Connect(cursor => {
                this.setState({ cursor });
            }),
            RunService.Heartbeat.Connect(() => {
                const cursorLocation = UserInputService.GetMouseLocation();
                if (this.state.cursorLocation.X !== cursorLocation.X || this.state.cursorLocation.Y !== cursorLocation.Y) {
                    this.setState({ cursorLocation });
                }
            }),
            player.GetAttributeChangedSignal(BRUSH_ID_ATTRIBUTE).Connect(() => {
                this.setState({ uiColorsChanged: true })
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
        const cursor = this.state.cursor;
        const cursorSize = new UDim2(0, this.props.cursorSize, 0, this.props.cursorSize);
        const cursorPosition = new UDim2(
            0, this.state.cursorLocation.X - cursorSize.Width.Offset / 2,
            0, this.state.cursorLocation.Y - cursorSize.Height.Offset / 2
        );

        if (cursor.type === "brush") {
            const brush = getPlayerBrush(player);
            if (!brush) return;

            return <>
                <imagelabel
                    Size={cursorSize}
                    Position={cursorPosition}
                    Image={cursor.baseImage}
                    BackgroundTransparency={1}
                />
                <imagelabel
                    Size={cursorSize}
                    Position={cursorPosition}
                    Image={cursor.colorImage}
                    BackgroundTransparency={1}
                    ImageColor3={brush.color.type === "label" ? this.color(brush.color.label) : brush.color.color}
                />
            </>
        }
    }
}

const cursorUi = <screengui
    ResetOnSpawn={false}
    IgnoreGuiInset={true}
>
    <CustomCursor cursorSize={64} />
</screengui>

Roact.mount(cursorUi, Players.LocalPlayer.WaitForChild("PlayerGui"));

const random = new Random();

let mousePositionLastTick = UserInputService.GetMouseLocation();
let velocityLastTick = Vector2.zero;
let lastTick = tick();
RunService.Heartbeat.Connect(delta => {
    const now = tick();
    if (now - lastTick < (1/60)) return;
    lastTick = now;
    delta = math.max(delta, 1 / 60);

    const mouseLocation = UserInputService.GetMouseLocation();
    const velocity = mouseLocation.sub(mousePositionLastTick).div(delta);

    // if (velocityLastTick.Magnitude < 0.001) {
    //     mousePositionLastTick = mouseLocation;
    //     velocityLastTick = velocity;
    //     return;
    // }

    const predictedPosition = mousePositionLastTick.add(velocityLastTick);

    if (
        getCurrentCursor().type === "brush" &&
        (
            (predictedPosition.sub(mouseLocation).Magnitude > 1000 && velocity.Magnitude <= velocityLastTick.Magnitude) ||
            random.NextNumber() < (1.46 * delta)
        )
    ) {
        const brush = getPlayerBrush(player);
        if (!brush) return;

        spawnParticle(
            {
                position: mouseLocation.add(new Vector2(
                    random.NextInteger(0, 5),
                    random.NextInteger(0, 5)
                )),
                velocity: velocityLastTick.mul(0.0035).add(new Vector2(0, 1)),
                label: brush.color.type === "label" ? brush.color.label : "Red",
                fadeIn: 1
            },
            (state, delta, screenSize, particle) => {
                state.velocity = state.velocity.mul(1 - 1.2 * delta).add(new Vector2(0, 60 * delta))
                state.position = state.position.add(state.velocity.div(1/60).mul(delta));

                state.fadeIn = math.max(0, state.fadeIn - delta * 16);

                if (state.position.Y + 6 >= screenSize.Y || state.position.X - 4 < 0 || state.position.X + 4 >= screenSize.X) {
                    particle.shouldDestroy = true;
                }
            },
            (state) => {
                const angle = math.atan2(state.velocity.Y, state.velocity.X);
                const degrees = math.deg(angle) - 90;

                return <frame
                    Size={new UDim2(0, 8, 0, 8)}
                    Rotation={degrees}
                    Position={new UDim2(0, state.position.X, 0, state.position.Y)}
                    BackgroundTransparency={1}
                >
                    <imagelabel
                        Image="rbxassetid://121367862833584"
                        Size={new UDim2(0, 8, 0, 8)}
                        Position={new UDim2(0, -4, 0, -6)}
                        BackgroundTransparency={1}
                        ImageColor3={getUiColor(state.label)}
                        ImageTransparency={state.fadeIn}
                    />
                </frame>
            }
        )
    }

    mousePositionLastTick = mouseLocation;
    velocityLastTick = velocity;
})