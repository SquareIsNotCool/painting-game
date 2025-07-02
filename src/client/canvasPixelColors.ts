import { RunService, Workspace } from "@rbxts/services";
import { $print } from "rbxts-transform-debug";
import { hashColor } from "shared/utils/color";

const pixels = (Workspace.WaitForChild("Canvas").GetChildren() as Model[]).map(pixel => {
    return {
        baseLayer: pixel.WaitForChild("BaseLayer") as Part,
        paintLayer: pixel.WaitForChild("PaintLayer") as Part
    }
});

let hasAverageColorChanged = false;
let lastColor = 0;
let averageColor = new Color3();
export function getAverageCanvasColor(): Color3 {
    return averageColor;
}
export function getHasAverageColorChanged() {
    return hasAverageColorChanged;
}

const averageColorChangedEvent = new Instance("BindableEvent");
averageColorChangedEvent.Name = "AverageCanvasColorChanged";
const averageCanvasColorChanged = averageColorChangedEvent.Event;
export { averageCanvasColorChanged };

RunService.Heartbeat.Connect(() => {
    const colorValues = { r: 0, g: 0, b: 0 };

    for (const pixel of pixels) {
        const pixelColor = pixel.paintLayer.Color.Lerp(pixel.baseLayer.Color, pixel.paintLayer.Transparency);
        colorValues.r += pixelColor.R;
        colorValues.g += pixelColor.G;
        colorValues.b += pixelColor.B;
    }

    lastColor = hashColor(averageColor);

    const count = pixels.size();
    averageColor = new Color3(
        colorValues.r / count,
        colorValues.g / count,
        colorValues.b / count
    );
    hasAverageColorChanged = hashColor(averageColor) !== lastColor;
    if (hasAverageColorChanged) {
        averageColorChangedEvent.Fire();
    }
})