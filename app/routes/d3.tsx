import {createContext, useEffect, useRef, useState} from 'react';
import anime from 'animejs';
import type {AnimeInstance} from 'animejs';
import type * as THREE from 'three';

import type {MeshProps} from '@react-three/fiber';
import {Canvas, useFrame} from '@react-three/fiber';

import {withRenderIfMounted} from '~/hoc/withRenderIfMounted';
import {WebGL} from '~/engine/gl';

const GlobalInit = {
    setInfo() {},
};
const GlobalContext = createContext(GlobalInit);

const Box: React.FC<MeshProps & {x: number; y: number}> = ({x, y, ...props}) => {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null!);
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    // const [active, setActive] = useState(false);

    const animation = useRef<AnimeInstance>();

    const scaleAnimation = useRef<AnimeInstance>();
    const scaleRef = useRef({scale: 0.6, x, y});
    const [scale, setScale] = useState(scaleRef.current.scale);

    useFrame(() => {
        // Rotate mesh every frame, this is outside of React without overhead
        animation.current =
            animation.current ||
            anime({
                targets: mesh.current.rotation,
                x: 4,
                y: -4,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutQuad',
                duration: 3000,
                autoplay: true,
            });
        scaleAnimation.current =
            scaleAnimation.current ||
            anime({
                targets: scaleRef.current,
                scale: [
                    {value: 0.6, easing: 'easeOutSine', duration: 500},
                    {value: 2, easing: 'easeInOutQuad', duration: 600},
                ],
                direction: 'normal',
                easing: 'easeInOutSine',
                autoplay: true,
                duration: 300,
                update() {
                    setScale(scaleRef.current.scale);
                },
            });
    });

    function handleClick() {
        const anime = scaleAnimation.current;
        if (!anime) return;
        // if(completed || (began && !completed)) reverse();
        // else play();
        scaleAnimation.current?.reverse();
        scaleAnimation.current?.play();
    }

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={scale}
            onClick={handleClick}
            onPointerOver={(event) => setHover(true)}
            onPointerOut={(event) => setHover(false)}
        >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
};

function Scene() {
    const [warning, setWarning] = useState('');
    const [info, setInfo] = useState('');

    const lightPosition = useRef({x: 5, y: 5, z: 5});
    const animation = useRef<AnimeInstance>();
    const depthAnimationRef = useRef<AnimeInstance>();
    const depthRef = useRef({depth: 0});
    const [depth, setDepth] = useState(depthRef.current.depth);
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        animation.current =
            animation.current ||
            anime({
                targets: lightPosition.current,
                x: -5,
                y: -5,
                z: -5,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutElastic',
                duration: 10000,
                autoplay: true,
            });
        depthAnimationRef.current =
            depthAnimationRef.current ||
            anime({
                targets: depthRef.current,
                depth: [
                    {value: -0.3, easing: 'easeOutSine', duration: 500},
                    {value: 0.3, easing: 'easeOutSine', duration: 500},
                ],
                direction: 'alternate',
                autoplay: true,
                loop: true,
                duration: 10000,
                update() {
                    setDepth(depthRef.current.depth);
                }
            });
    });

    useEffect(function () {
        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            setWarning(warning.innerText);
        } else {
            setWarning('WebGL is active.');
        }
    }, []);

    function handleStartRound() {
        setInfo(`${info}\nOne more round`);
    }

    const lightPositionVector = Object.values(lightPosition.current) as [number, number, number];

    return (
        <GlobalContext.Provider value={{setInfo: handleStartRound}}>
            {warning}
            {info}
            <ambientLight />
            <pointLight position={lightPositionVector} />
            {[
                ...(function* gas() {
                    for (let i = -10; i < 10; i = i + 1) {
                        for (let j = -10; j < 10; j = j + 1) {
                            yield <Box key={`${fmtKey(i)}_${fmtKey(j)}`} x={i} y={j} position={[i, j, depth * Math.sin(i) * (j) * 1e-1]} />;
                        }
                    }
                })(),
            ]}
        </GlobalContext.Provider>
    );
}

function fmtKey(i: number) {
    return i.toLocaleString('en-EN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const CAMERA_DEFAULTS = {
    near: 1e-2,
    aspect: 1,
    fov: 75,
    position: [0, 0, 10] as [number, number, number],
};

function View() {
    return (
        <div style={{height: '100vh'}}>
            <Canvas camera={CAMERA_DEFAULTS}>
                <Scene />
            </Canvas>
        </div>
    );
}

export default withRenderIfMounted(View);
