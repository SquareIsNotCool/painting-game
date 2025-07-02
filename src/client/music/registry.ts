import { RBXAsset } from "shared/types";

export interface Album {
    name: string,
    cover: RBXAsset
}
type AlbumId = keyof typeof albums;

export interface Track {
    name: string,
    artists: string[],
    album: AlbumId,
    src: RBXAsset
}

export const albums = {
    aura: {
        name: "aura",
        cover: "rbxassetid://121387348839103"
    }
} satisfies Record<string, Album>;

export const tracks: readonly Track[] = [
    {
        name: "we worked so hard to leave equestria and now all i want is to go back",
        artists: ["Vylvet Pony"],
        album: "aura",
        src: "rbxassetid://120870483796914"
    },
    {
        name: "aura",
        artists: ["Vylvet Pony"],
        album: "aura",
        src: "rbxassetid://108105463703762"
    },
    {
        name: "do you remember the song she sang",
        artists: ["Vylvet Pony"],
        album: "aura",
        src: "rbxassetid://120857534065995"
    },
    {
        name: "the child who dreamt it all",
        artists: ["Vylvet Pony"],
        album: "aura",
        src: "rbxassetid://100673635421879"
    },
    {
        name: "there",
        artists: ["Vylvet Pony"],
        album: "aura",
        src: "rbxassetid://126580576199147"
    },
];