import { Workspace } from "@rbxts/services";

export function createFolder(name: string, parent?: Instance): Folder {
    const folder = new Instance("Folder");
    folder.Name = name;
    if (parent) folder.Parent = parent;
    return folder;
}