import { TweenService } from "@rbxts/services";

export interface TweenOptions {
    time?: number,
    easingStyle?: Enum.EasingStyle,
    easingDirection?: Enum.EasingDirection,
    repeatCount?: number,
    reverses?: boolean,
    delayTime?: number
}

export class Tweened {
    private container = new Instance("NumberValue");
    private tweenInstance: Tween | undefined;

    private defaultOptions: TweenOptions;

    private valueChangedEvent = new Instance("BindableEvent") as BindableEvent<(value: number) => void>;
    public readonly valueChanged = this.valueChangedEvent.Event;

    private connection = this.container.GetPropertyChangedSignal("Value").Connect(() => {
        this.valueChangedEvent.Fire(this.container.Value);
    })

    constructor(initialValue: number, defaultOptions: TweenOptions = {}) {
        this.container.Value = initialValue
        this.defaultOptions = defaultOptions;
    }

    public tween(value: number, options: TweenOptions = {}) {
        this.stop();
        this.tweenInstance = TweenService.Create(
            this.container,
            new TweenInfo(
                options.time ?? this.defaultOptions.time,
                options.easingStyle ?? this.defaultOptions.easingStyle ?? Enum.EasingStyle.Linear,
                options.easingDirection ?? this.defaultOptions.easingDirection ?? Enum.EasingDirection.InOut,
                options.repeatCount ?? this.defaultOptions.repeatCount ?? 0,
                options.reverses ?? this.defaultOptions.reverses ?? false,
                options.delayTime ?? this.defaultOptions.delayTime ?? 0,
            ),
            { Value: value }
        );
        this.tweenInstance.Play();
    }
    public pause() {
        this.tweenInstance?.Pause();
    }
    public stop() {
        this.tweenInstance?.Pause();
        this.tweenInstance?.Destroy();
        this.tweenInstance = undefined;
    }
    public setValue(value: number) {
        this.stop();
        this.container.Value = value;
    }

    public getValue() {
        return this.container.Value;
    }

    public destroy() {
        this.stop();
        this.connection.Disconnect();
        this.container.Destroy();
    }
}