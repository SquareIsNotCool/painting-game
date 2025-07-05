import Roact, { Component } from "@rbxts/roact";
import Hooks from "@rbxts/roact-hooks";
import { GuiService, Players, RunService, Workspace } from "@rbxts/services";
import { $dbg, $print, $warn } from "rbxts-transform-debug";
import { RBXAsset } from "shared/types";

const MIN_FPS = 25;
const MAX_SLOW_FRAMES = 3;

type RenderFunction<S> = (state: S) => Roact.Element | undefined;
type TickFunction<S> = (state: S, delta: number, screenSize: Vector2, particle: Particle<S>) => void;

interface Particle<S> {
    render: RenderFunction<S>,
    tick: TickFunction<S>,
    state: S,
    shouldDestroy: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const particles = new Set<Particle<any>>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const particlesUpdatedEvent = new Instance("BindableEvent") as BindableEvent<(particles: Set<Particle<any>>) => void>;

export function spawnParticle<S>(initialState: S, tick: TickFunction<S>, render: RenderFunction<S>) {
    const particle: Particle<S> = {
        tick,
        render,
        state: initialState,
        shouldDestroy: false
    };
    particles.add(particle as Particle<S>);
}

let slowFramesCount = 0;
let lastHeartbeatWasEmpty = true;
RunService.RenderStepped.Connect(delta => {
    if (particles.size() <= 0) {
        if (!lastHeartbeatWasEmpty) {
            lastHeartbeatWasEmpty = true;
            particlesUpdatedEvent.Fire(particles);
        }
        return;
    }

    if ((1 / delta) < MIN_FPS) {
        slowFramesCount += 1;
        if (slowFramesCount >= MAX_SLOW_FRAMES) {
            particles.clear();
            $warn("Screen particles cleared due to low fps");
            return;
        }
    }

    const camera = Workspace.CurrentCamera;
    if (!camera) return;
    const screenSize = camera.ViewportSize;
    for (const particle of particles) {
        particle.tick(particle.state, delta, screenSize, particle);
        if (particle.shouldDestroy) {
            particles.delete(particle);
        }
    }
    lastHeartbeatWasEmpty = false;
    particlesUpdatedEvent.Fire(particles);
})

// let updateFrame = (t: number) => {};
const ParticlesRendererComponent: Hooks.FC = (props, { useState, useEffect }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [skipRender, setSkipRender] = useState(0);

    useEffect(() => {
        const connection = RunService.RenderStepped.Connect(delta => {
            setCurrentTime(tick());
            if ((1 / delta) < MIN_FPS) {
                setSkipRender(x => x + 1);
            }
            else setSkipRender(0);
        })
        return () => connection.Disconnect();
    })

    if (skipRender >= MAX_SLOW_FRAMES) return <></>;
    // 
    // const frameString = frameBinding.map(x => `${x}`);
    const elements = [...particles].map(particle => particle.render(particle.state));
    return (<>
        { ...elements }
    </>)
}

const ParticlesRenderer = new Hooks(Roact)(ParticlesRendererComponent);

// const [frameBinding, setFrameBinding] = Roact.createBinding(0);
// RunService.RenderStepped.Connect(() => {
//     setFrameBinding(tick());
// });

const particlesUi = <screengui
    ResetOnSpawn={false}
    IgnoreGuiInset={true}
>
    <ParticlesRenderer />
</screengui>;

Roact.mount(particlesUi, Players.LocalPlayer.WaitForChild("PlayerGui"));