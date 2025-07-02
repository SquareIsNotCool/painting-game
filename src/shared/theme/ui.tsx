import Roact, { Binding, Children, Component, PropsWithChildren, PureComponent } from "@rbxts/roact";
import { flavorManager } from "./flavorManager";
import { FlavorInfo, labels, LabelWithInverse } from "./catppuccin";
import { $dbg, $print } from "rbxts-transform-debug";
import { TweenService } from "@rbxts/services";
import { TWEEN_INFO } from "./easing";

// export function useFlavor(): [Binding<typeof flavorManager>, RBXScriptConnection] {
//     const [state, setState] = Roact.createBinding(flavorManager);

//     const connection = flavorManager.changed.Connect(() => {
//         setState(flavorManager);
//     })

//     return [state, connection];
// }

const isLight = new Instance("NumberValue");
let isLightTween: Tween | undefined = undefined;
isLight.Value = flavorManager.getFlavor().light ? 1 : 0;

interface UiColor {
    color: Color3Value,
    tween?: Tween
}
const uiColors = {} as Record<LabelWithInverse, UiColor>;
for (const label of labels) {
    const inverseLabel: LabelWithInverse = `Inverse${label}`;
    const normalInstance = new Instance("Color3Value");
    normalInstance.Value = flavorManager.getColor(label);

    const inverseInstance = new Instance("Color3Value");
    inverseInstance.Value = flavorManager.getColor(inverseLabel);
    uiColors[label] = {
        color: normalInstance
    }
    uiColors[inverseLabel] = {
        color: inverseInstance
    }
}

function tween(label: LabelWithInverse) {
    const entry = uiColors[label];

    entry.tween?.Pause();
    entry.tween?.Destroy();

    const newTween = TweenService.Create(entry.color, TWEEN_INFO, {
        Value: flavorManager.getColor(label)
    });
    newTween.Play();
    newTween.Completed.Connect(state => {
        if (state === Enum.PlaybackState.Completed) {
            newTween.Destroy();
            entry.tween = undefined;
        }
    })
    entry.tween = newTween;
}

flavorManager.changed.Connect(() => {
    for (const label of labels) {
        const inverseLabel: LabelWithInverse = `Inverse${label}`;

        tween(label);
        tween(inverseLabel);
    }

    isLightTween?.Pause();
    isLightTween?.Destroy();
    isLightTween = TweenService.Create(isLight, TWEEN_INFO, {
        Value: flavorManager.getFlavor().light ? 1 : 0
    });
    isLightTween.Play();
    isLightTween.Completed.Connect(state => {
        if (state === Enum.PlaybackState.Completed) {
            isLightTween?.Destroy();
            isLightTween = undefined;
        }
    })
});

export function getUiColor(label: LabelWithInverse) {
    return uiColors[label].color.Value;
}
export function getIsUiLight() {
    return isLight.Value;
}
export function getIsUiDark() {
    return 1 - getIsUiLight();
}

export const uiColorsChanged = uiColors.Base.color.GetPropertyChangedSignal("Value");