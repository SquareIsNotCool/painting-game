import { UserInputService } from "@rbxts/services"
import { RBXAsset } from "shared/types"

interface HiddenCursor {
    type: "hidden"
}
interface DefaultCursor {
    type: "default"
}
interface ImageCursor {
    type: "image",
    image: RBXAsset
}
interface BrushCursor {
    type: "brush",
    baseImage: RBXAsset,
    colorImage: RBXAsset
}

export type Cursor = HiddenCursor | DefaultCursor | ImageCursor | BrushCursor;

export const cursors = {
    default: { type: "default" },
    brush: {
        type: "brush",
        baseImage: "rbxassetid://72508665471223",
        colorImage: "rbxassetid://79210094740929"
    }
} satisfies Record<string, Cursor>

const cursorChangedEvent = new Instance("BindableEvent") as BindableEvent<(cursor: Cursor) => void>;
export const cursorChanged = cursorChangedEvent.Event;

let currentCursor: Cursor = cursors.default;
export function getCurrentCursor() {
    return currentCursor;
}
export function setCursor(cursor: Cursor) {
    if (cursor === currentCursor) return;
    if (cursor.type === "default" || cursor.type === "image") {
        UserInputService.MouseIcon = cursor.type === "image" ? cursor.image : "";
        UserInputService.MouseIconEnabled = true;
    }
    else {
        UserInputService.MouseIconEnabled = false;
        UserInputService.MouseIcon = "";
    }
    currentCursor = cursor;
    cursorChangedEvent.Fire(cursor);
}