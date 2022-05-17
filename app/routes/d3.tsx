import {createContext, useEffect, useRef, useState} from 'react';
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

const Box: React.FC<MeshProps & {x: number; y: number}> = ({x, y, ...props}) => {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null!);
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    // const [active, setActive] = useState(false);

    useAnimeFiber({
        targets: mesh.current?.rotation,
        x: 4,
        y: -4,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutQuad',
        duration: 3000,
        autoplay: true,
    });

    const [scale, scaleAnimation] = useAnimeFiber({
        scale: [
            {value: 0.6, easing: 'easeOutSine', duration: 500},
            {value: 2, easing: 'easeInOutQuad', duration: 600},
        ],
        direction: 'normal',
        easing: 'easeInOutSine',
        autoplay: true,
        duration: 300,
    }, {scale: 1});

    function handleClick() {
        if (!scaleAnimation) return;
        // if(completed || (began && !completed)) reverse();
        // else play();
        scaleAnimation.reverse();
        scaleAnimation.play();
    }

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={scale.scale}
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

    // Rotate mesh every frame, this is outside of React without overhead

    const [depth] = useAnimeFiber(
        {
            depth: [
                {value: -0.3, easing: 'easeOutSine', duration: 500},
                {value: 0.3, easing: 'easeOutSine', duration: 500},
            ],
            direction: 'alternate',
            autoplay: true,
            loop: true,
            duration: 10000,
        },
        {depth: 0},
    );

    const [lightPosition] = useAnimeFiber(
        {
            x: -5,
            y: -5,
            z: -5,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutElastic',
            duration: 10000,
            autoplay: true,
        },
        {x: 5, y: 5, z: 5},
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
                    for (let i = -10; i < 10; i = i + 1) {
                        for (let j = -10; j < 10; j = j + 1) {
                            yield (
                                <Box
                                    key={`${fmtKey(i)}_${fmtKey(j)}`}
                                    x={i}
                                    y={j}
                                    position={[i, j, depth.depth * Math.sin(i) * j * 1e-1]}
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
