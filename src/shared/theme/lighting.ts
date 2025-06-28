import { TweenService, Lighting } from "@rbxts/services";
import { FlavorInfo } from "./catppuccin";
import { TWEEN_INFO } from "./easing";
import { flavorManager } from "./flavorManager";

function setLightingColors(flavor: FlavorInfo, skipTween = false) {
    const clockTime = flavor.light ? 7.4 : 0;
    if (skipTween) {
        Lighting.ClockTime = clockTime;
        return;
    }
    const tween = TweenService.Create(
        Lighting,
        TWEEN_INFO,
        {
            // FogColor: flavor.colors.Crust,
            ClockTime: clockTime
        }
    );
    tween.Play();
}

flavorManager.changed.Connect(flavor => {
    setLightingColors(flavor);
})
setLightingColors(flavorManager.getFlavor(), true);