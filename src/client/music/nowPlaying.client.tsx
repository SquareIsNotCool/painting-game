import Roact, { Children, Component, PropsWithChildren } from "@rbxts/roact";
import { Players, TweenService, Workspace } from "@rbxts/services";
import { albums } from "./registry";
import { flavorManager } from "shared/theme/flavorManager";
import { $dbg } from "rbxts-transform-debug";
import { LabelWithInverse } from "shared/theme/catppuccin";
import { getCurrentTrack, LoadedTrack, newTrack } from "./musicPlayer";
import { pluralAnd } from "shared/utils/string";

const tweenInfo = (dir: Enum.EasingDirection) => new TweenInfo(4.5, Enum.EasingStyle.Cubic, dir);

class SongDisplay extends Component<object, { flavor: typeof flavorManager, trackInfo: LoadedTrack, transition: number }> {
    private connections!: RBXScriptConnection[];
    private transitionValue!: NumberValue;
    private tween: Tween | undefined;
    private thread: thread | undefined;

    protected init() {
        this.setState({ flavor: flavorManager, trackInfo: getCurrentTrack(), transition: 0 });
    }

    protected didMount(): void {
        this.transitionValue = new Instance("NumberValue");
        this.transitionValue.Parent = Workspace;
        this.connections = [
            flavorManager.changed.Connect(() => {
                this.setState({ flavor: flavorManager });
            }),
            newTrack.Connect(track => {
                this.transitionValue.Value = 0;
                this.tween?.Cancel();
                if (this.thread) task.cancel(this.thread);
                this.setState({ trackInfo: track });
                this.thread = task.spawn(() => {
                    this.tween = TweenService.Create(this.transitionValue, tweenInfo(Enum.EasingDirection.Out), {
                        Value: 1
                    });
                    this.tween.Play();
                    task.wait(15);
                    this.tween = TweenService.Create(this.transitionValue, tweenInfo(Enum.EasingDirection.In), {
                        Value: 2
                    });
                    this.tween.Play();
                })
            }),
            this.transitionValue.GetPropertyChangedSignal("Value").Connect(() => {
                this.setState({ transition: this.transitionValue.Value });
            })
        ];
    }

    protected willUnmount(): void {
        for (const connection of this.connections) {
            connection.Disconnect();
        }
        if (this.thread) task.cancel(this.thread);
        this.tween?.Cancel();
        this.tween?.Destroy();
        this.transitionValue.Destroy();
    }

    private color(label: LabelWithInverse) {
        return this.state.flavor.getColor(label);
    }

    public render(): Roact.Element | undefined {
        const transparency = this.state.transition > 1 ? (1 - (this.state.transition - 1)) : this.state.transition
        // if (!this.state.track) return undefined;
        return (
            <frame
                AnchorPoint={new Vector2(0, 1)}
                Position={new UDim2(0, math.lerp(-16, 32, this.state.transition), 1, -32)}
                BackgroundColor3={this.color("Base")}
                BackgroundTransparency={math.lerp(1, 0.05, transparency)}
                Ref={frame}
                AutomaticSize={Enum.AutomaticSize.XY}
            >
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
                    ImageTransparency={1 - transparency}
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
                        TextTransparency={1 - transparency}
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
                            TextTransparency={1 - transparency}
                            Font={"SourceSansSemibold"}
                            TextSize={24}
                            BackgroundTransparency={1}
                            AutomaticSize={Enum.AutomaticSize.XY}
                        />
                        <textlabel
                            Text={pluralAnd(this.state.trackInfo.track.artists)}
                            TextColor3={this.color("Subtext0")}
                            TextTransparency={1 - transparency}
                            Font={"SourceSans"}
                            TextSize={20}
                            BackgroundTransparency={1}
                            AutomaticSize={Enum.AutomaticSize.XY}
                        />
                    </frame>
                </frame>
            </frame>
        )
    }
}

const frame = Roact.createRef<Frame>();
const app = <screengui>
    <SongDisplay></SongDisplay>
</screengui>;

Roact.mount(app, Players.LocalPlayer.WaitForChild("PlayerGui"));