import { GuiService, Players, RunService, UserInputService, Workspace } from "@rbxts/services";
import { COOLDOWN_ATTRIBUTE, PIXEL_ID_ATTRIBUTE, remotes } from "shared/canvas";
import { registerFailedPaintAttempt } from "./cooldownScreen";
import { RBXAsset } from "shared/types";
import { cursors, setCursor } from "./customCursor/customCursor";

const player = Players.LocalPlayer;

function raycastFromScreenPoint(screenPoint?: Vector2 | Vector3) {
    const camera = Workspace.CurrentCamera;
    if (!camera) return;
    const character = player.Character;
    if (!character) return;

    const rayOrigin = camera.CFrame.Position;
    let rayDirection: Vector3;
    if (screenPoint) {
        const insets = GuiService.GetGuiInset()[0];
        rayDirection = camera.ScreenPointToRay(screenPoint.X - insets.X, screenPoint.Y - insets.Y).Direction.mul(1000);
    }
    else {
        rayDirection = camera.CFrame.LookVector.mul(1000);
    }

    const raycastParams = new RaycastParams();
    raycastParams.FilterDescendantsInstances = [character];
    raycastParams.FilterType = Enum.RaycastFilterType.Exclude;

    return Workspace.Raycast(rayOrigin, rayDirection, raycastParams);
}

function getHoveredPixelId(): number | undefined {
    const result = raycastFromScreenPoint(UserInputService.GetMouseLocation());
    if (!result) return;

    const pixelId = result.Instance.GetAttribute(PIXEL_ID_ATTRIBUTE);
    if (!typeIs(pixelId, "number")) return;
    return pixelId;
}

function raycastFromInput(input: InputObject) {
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        return getHoveredPixelId();
    }
    else if (input.UserInputType === Enum.UserInputType.Touch) {
        return getHoveredPixelId();
    }
    else if (input.UserInputType === Enum.UserInputType.Gamepad1 && input.KeyCode === Enum.KeyCode.ButtonX) {
        return getHoveredPixelId();
    }
}

UserInputService.InputBegan.Connect((input, gameProcessed) => {
    const pixelId = raycastFromInput(input);
    if (pixelId === undefined) return;

    const cooldown = player.GetAttribute(COOLDOWN_ATTRIBUTE);
    if (typeIs(cooldown, "number") && cooldown > 0) {
        registerFailedPaintAttempt();
        return;
    }

    remotes.paintPixel(pixelId);
});

RunService.Heartbeat.Connect(() => {
    const pixelId = getHoveredPixelId();
    if (pixelId === undefined) setCursor(cursors.default);
    else setCursor(cursors.brush);
})