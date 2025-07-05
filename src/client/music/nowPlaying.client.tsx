import Roact, { Children, Component, PropsWithChildren } from "@rbxts/roact";
import { Players, TweenService, Workspace } from "@rbxts/services";
import { albums } from "./registry";
import { flavorManager } from "shared/theme/flavorManager";
import { $dbg } from "rbxts-transform-debug";
import { LabelWithInverse } from "shared/theme/catppuccin";
import { getCurrentTrack, LoadedTrack, newTrack } from "./musicPlayer";
import { pluralAnd } from "shared/utils/string";
import { getIsUiDark, getUiColor, uiColorsChanged } from "shared/theme/ui";
import { averageCanvasColorChanged, getAverageCanvasColor } from "client/canvasPixelColors";
import { Tweened } from "shared/tweened";

class SongDisplay extends Component<object, { uiColorsChanged: boolean, trackInfo: LoadedTrack, transition: number }> {
    private connections!: RBXScriptConnection[];
    private transition!: Tweened;
    private thread: thread | undefined;

    protected init() {
        this.setState({ uiColorsChanged: false, trackInfo: getCurrentTrack(), transition: 0 });
    }

    protected didMount(): void {
        this.transition = new Tweened(0, {
            time: 4.5,
            easingStyle: Enum.EasingStyle.Cubic
        });
        this.connections = [
            uiColorsChanged.Connect(() => {
                this.setState({ uiColorsChanged: true })
            }),
            averageCanvasColorChanged.Connect(() => {
                this.setState({ uiColorsChanged: true })
            }),
            newTrack.Connect(track => {
                this.transition.setValue(0);
                if (this.thread) task.cancel(this.thread);
                this.setState({ trackInfo: track });
                this.thread = task.spawn(() => {
                    this.transition.tween(1, { easingDirection: Enum.EasingDirection.Out });
                    task.wait(15);
                    this.transition.tween(2, { easingDirection: Enum.EasingDirection.In });
                })
            }),
            this.transition.valueChanged.Connect((value) => {
                this.setState({ transition: value });
            })
        ];
    }

    protected willUnmount(): void {
        for (const connection of this.connections) {
            connection.Disconnect();
        }
        if (this.thread) task.cancel(this.thread);
        this.transition.destroy();
    }

    private color(label: LabelWithInverse) {
        return getUiColor(label);
    }

    public render(): Roact.Element | undefined {
        const transition = this.state.transition > 1 ? (1 - (this.state.transition - 1)) : this.state.transition;
        const averageCanvasColor = getAverageCanvasColor();
        const isDark = getIsUiDark();
        // if (!this.state.track) return undefined;
        return (
            <frame
                AnchorPoint={new Vector2(0, 1)}
                Position={new UDim2(0, math.lerp(-16, 32, this.state.transition), 1, -32)}
                BackgroundColor3={this.color("Base")}
                BackgroundTransparency={math.lerp(1, 0.05, transition)}
                Ref={frame}
                AutomaticSize={Enum.AutomaticSize.XY}
            >
                <uicorner
                    CornerRadius={new UDim(0, 16)}
                />
                <frame
                    AutomaticSize={Enum.AutomaticSize.XY}
                >
                    <uigradient
                        Color={new ColorSequence(averageCanvasColor)}
                        Rotation={-45}
                        Transparency={new NumberSequence([
                            new NumberSequenceKeypoint(0, math.lerp(1, math.lerp(0.9, 0.8, isDark), transition)),
                            // new NumberSequenceKeypoint(0.85, 1),
                            new NumberSequenceKeypoint(1, math.lerp(1, math.lerp(1, 0.95, isDark), transition)),
                        ])}
                    />
                    <uipadding
                        PaddingLeft={new UDim(0, 8)}
                        PaddingRight={new UDim(0, 32)}
                        PaddingBottom={new UDim(0, 8)}
                        PaddingTop={new UDim(0, 8)}
                    />
                    <uicorner
                        CornerRadius={new UDim(0, 16)}
                    />
                    <uilistlayout Padding={new UDim(0, 8)} FillDirection={Enum.FillDirection.Horizontal} />
                    <imagelabel
                        Size={new UDim2(0, 64, 0, 64)}
                        ImageContent={Content.fromUri(this.state.trackInfo.album.cover)}
                        BackgroundTransparency={1}
                        ImageTransparency={1 - transition}
                    >
                        <uicorner CornerRadius={new UDim(0, 24 - 16)} />
                    </imagelabel>
                    <frame
                        BackgroundTransparency={1}
                        AutomaticSize={Enum.AutomaticSize.XY}
                    >
                        <uilistlayout Padding={new UDim(0, 0)} FillDirection={Enum.FillDirection.Vertical} />
                        <textlabel
                            Text="Now Playing"
                            TextColor3={this.color("Overlay2")}
                            TextTransparency={1 - transition}
                            Font={"SourceSansItalic"}
                            TextSize={15}
                            BackgroundTransparency={1}
                            AutomaticSize={Enum.AutomaticSize.XY}
                        />
                        <frame
                            BackgroundTransparency={1}
                            AutomaticSize={Enum.AutomaticSize.XY}
                        >
                            <uilistlayout Padding={new UDim(0, 0)} FillDirection={Enum.FillDirection.Vertical} />
                            <textlabel
                                Text={this.state.trackInfo.track.name}
                                TextColor3={this.color("Text")}
                                TextTransparency={1 - transition}
                                Font={"SourceSansSemibold"}
                                TextSize={24}
                                BackgroundTransparency={1}
                                AutomaticSize={Enum.AutomaticSize.XY}
                            />
                            <textlabel
                                Text={pluralAnd(this.state.trackInfo.track.artists)}
                                TextColor3={this.color("Subtext0")}
                                TextTransparency={1 - transition}
                                Font={"SourceSans"}
                                TextSize={20}
                                BackgroundTransparency={1}
                                AutomaticSize={Enum.AutomaticSize.XY}
                            />
                        </frame>
                    </frame>
                </frame>
            </frame>
        )
    }
}

const frame = Roact.createRef<Frame>();
const app = <screengui ResetOnSpawn={false}>
    <SongDisplay></SongDisplay>
</screengui>;

Roact.mount(app, Players.LocalPlayer.WaitForChild("PlayerGui"));