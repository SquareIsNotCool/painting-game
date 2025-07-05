import { ContentProvider, SoundService } from "@rbxts/services";
import { Album, albums, Track, tracks } from "./registry";
import { RBXAsset } from "shared/types";
import { $print } from "rbxts-transform-debug";

const random = new Random();

const newTrackEvent = new Instance("BindableEvent") as BindableEvent<(track: LoadedTrack) => void>;
export const newTrack = newTrackEvent.Event;

export interface LoadedTrack {
    instance: Sound,
    track: Track,
    album: Album
}
const sounds: LoadedTrack[] = tracks.map(track => {
    const sound = new Instance("Sound");
    sound.SoundId = track.src;
    sound.Volume = 0.2;
    sound.Name = `PreloadedTrack - ${track.name}`;
    sound.Parent = SoundService;
    sound.Looped = false;

    return {
        instance: sound,
        track,
        album: albums[track.album]
    }
});

ContentProvider.PreloadAsync(sounds.map(x => x.instance));

for (const sound of sounds) {
    if (!sound.instance.IsLoaded) sound.instance.Loaded.Wait();
}

function waitALittle(min = 5, max = 45) {
    const duration = math.lerp(min, max, random.NextNumber());
    $print(`Waiting ${duration} seconds..`)
    task.wait(duration);
}

let lastTrack: LoadedTrack = sounds[0];
function playNewTrack(): number {
    const tracks = sounds.filter(x => x.track.src !== lastTrack.track.src);
    const track = tracks[random.NextInteger(0, tracks.size() - 1)];
    const sound = track.instance;

    $print(`Playing track: "${track.track.name}" in "${track.album.name}" by [${track.track.artists.join(", ")}]`);

    lastTrack = track;

    sound.TimePosition = 0;
    sound.Play();

    newTrackEvent.Fire(track);

    return sound.TimeLength;
}

export function getCurrentTrack() {
    return lastTrack
}

task.spawn(() => {
    // task.wait(1);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        waitALittle(15, 60);
        const duration = playNewTrack();
        task.wait(duration)
    }
})