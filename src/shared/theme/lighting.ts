import { TweenService, Lighting } from "@rbxts/services";
import { FlavorInfo } from "./catppuccin";
import { EASE_DURATION, EASE_FUNCTION, EASE_DIRECTION } from "./easing";
import { flavorManager } from "./flavorManager";

function setLightingColors(flavor: FlavorInfo, skipTween = false) {
    const clockTime = flavor.light ? 7.4 : 0;
    if (skipTween) {
        Lighting.ClockTime = clockTime;
        return;
    }
    const tween = TweenService.Create(
        Lighting,
        new TweenInfo(EASE_DURATION, EASE_FUNCTION, EASE_DIRECTION),
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