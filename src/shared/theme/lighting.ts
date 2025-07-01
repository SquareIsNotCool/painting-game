import { TweenService, Lighting } from "@rbxts/services";
import { FlavorInfo } from "./catppuccin";
import { TWEEN_INFO_LIGHTING } from "./easing";
import { flavorManager } from "./flavorManager";

function setLightingColors(flavor: FlavorInfo, skipTween = false) {
    const clockTime = flavor.light ? 8.2 : 12;
    if (skipTween) {
        Lighting.ClockTime = clockTime;
        return;
    }
    const tween = TweenService.Create(
        Lighting,
        TWEEN_INFO_LIGHTING,
        {
            // FogColor: flavor.colors.Crust,
            ClockTime: clockTime
        }
    );
    tween.Play();
}

flavorManager.changed.Connect((flavor, skipTween) => {
    setLightingColors(flavor, skipTween);
})
setLightingColors(flavorManager.getFlavor(), true);