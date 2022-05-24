import {createContext, useEffect, useRef, useState} from 'react';
import type {AnimeInstance} from 'animejs';
import type * as THREE from 'three';

import type {MeshProps} from '@react-three/fiber';
import {Canvas} from '@react-three/fiber';

import {withRenderIfMounted} from '~/hoc/withRenderIfMounted';
import {WebGL} from '~/engine/gl';
import {useAnimeFiber} from '~/hooks/useAnimeFiber';

const GlobalInit = {
    setInfo() {},
};
const GlobalContext = createContext(GlobalInit);

interface BoxProps {
    x: number;
    y: number;
    scale: number;
    scaleAnimation: AnimeInstance | null;
    position: [number, number, number];
}

const Box: React.FC<MeshProps & BoxProps> = ({x, y, scale, scaleAnimation, position, ...props}) => {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useAnimeFiber({
        targets: mesh.current?.rotation,
        x: Math.PI / 2,
        y: Math.PI,
        z: -Math.PI / 2,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutQuint',
        duration: 2000,
        autoplay: true,
    });

    useAnimeFiber({
        targets: mesh.current?.position,
        x: position[0],
        y: position[1],
        z: position[2],
        easing: 'easeInOutCubic',
        duration: 1000,
        autoplay: true,
        endDelay: 5000
    });

    function handleClick() {
        if (!scaleAnimation) return;
        scaleAnimation.reverse();
        scaleAnimation.play();
    }

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={scale}
            position={[position[0] * 1e-3, position[1] * 1e-3, -10]}
            onClick={handleClick}
            onPointerOver={(event) => setHover(true)}
            onPointerOut={(event) => setHover(false)}
        >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'darkgreen'} metalness={.3} roughness={.5} emissive='black' emissiveIntensity={.1} transparent/>
        </mesh>
    );
};

const BOX_GRID_SIZE = 5;

function Scene() {
    const [warning, setWarning] = useState('');
    const [info, setInfo] = useState('');

    const [depth] = useAnimeFiber(
        {
            depth: [
                {value: -0.5, easing: 'easeOutSine', duration: 500},
                {value: 0.5, easing: 'easeOutSine', duration: 500},
            ],
            direction: 'alternate',
            autoplay: true,
            loop: true,
            duration: 9000,
            endDelay: 3000,
        },
        {depth: 0},
    );

    const [lightPosition] = useAnimeFiber(
        {
            x: [3, 6, 3],
            y: [4, 2, 4],
            z: [6, 8],
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutBounce',
            duration: 10000,
            autoplay: true,
        },
        {x: 5, y: 5, z: 6},
    );

    const [scale, scaleAnimation] = useAnimeFiber(
        {
            scale: [
                {value: 0.5, easing: 'easeOutSine', duration: 500},
                {value: 1.9, easing: 'easeInOutQuad', duration: 600},
            ],
            direction: 'alternate',
            easing: 'easeInOutSine',
            autoplay: true,
            loop: true,
            duration: 300,
            endDelay: 5700,
        },
        {scale: 1},
    );

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

    const lightPositionVector = Object.values(lightPosition) as [number, number, number];

    return (
        <GlobalContext.Provider value={{setInfo: handleStartRound}}>
            {warning}
            {info}
            <ambientLight />
            <pointLight position={lightPositionVector} />
            {[
                ...(function* gas() {
                    for (let i = -BOX_GRID_SIZE; i <= BOX_GRID_SIZE; i = i + 1) {
                        for (let j = -BOX_GRID_SIZE; j <= BOX_GRID_SIZE; j = j + 1) {
                            const z = 1.17 * Math.sqrt(i*i+j*j);

                            if(Math.abs(z) < 4) {
                                continue;
                            }
                            yield (
                                <Box
                                    key={`${fmtKey(i)}_${fmtKey(j)}`}
                                    x={i}
                                    y={j}
                                    scale={scale.scale}
                                    scaleAnimation={scaleAnimation}
                                    position={[i * 1.5, j * 0.9, z]}
                                />
                            );
                        }
                    }
                })(),
            ]}
        </GlobalContext.Provider>
    );
}

function fmtKey(i: number) {
    return i.toFixed(2);
}

const CAMERA_DEFAULTS = {
    position: [0, 0, 15] as [number, number, number],
};

function View() {
    return (
        <div style={{height: 'calc(100vh - 60px)'}}>
            <Canvas camera={CAMERA_DEFAULTS}>
                <Scene />
            </Canvas>
        </div>
    );
}

export default withRenderIfMounted(View);
