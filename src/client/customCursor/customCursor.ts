import { ContentProvider, UserInputService } from "@rbxts/services"
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
        baseImage: "rbxassetid://122545631716561",
        colorImage: "rbxassetid://125528513610708"
    }
} satisfies Record<string, Cursor>

const cursorChangedEvent = new Instance("BindableEvent") as BindableEvent<(cursor: Cursor) => void>;
export const cursorChanged = cursorChangedEvent.Event;

const preloadIds: RBXAsset[] = [];
for (const [name, cursor] of pairs(cursors)) {
    if (cursor.type === "brush") {
        preloadIds.push(cursor.baseImage, cursor.colorImage);
    }
}
ContentProvider.PreloadAsync(preloadIds);

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