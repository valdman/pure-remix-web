import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import type * as THREE from 'three';
import type { AnimeInstance } from 'animejs';
import anime from 'animejs';

import type {MeshProps} from '@react-three/fiber';
import {Canvas, useFrame} from '@react-three/fiber';
import type { StoreProps } from '@react-three/fiber/dist/declarations/src/core/store';

import {withRenderIfMounted} from '~/hoc/withRenderIfMounted';
import {WebGL} from '~/engine/gl';

const GlobalInit = {
    setInfo(){},
};
const GlobalContext = createContext(GlobalInit);

const Box: React.FC<MeshProps> = (props) => {
    // This reference will give us direct access to the mesh
    const mesh = useRef<THREE.Mesh>(null!);
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false);
    // const [active, setActive] = useState(false);
    
    const {setInfo} = useContext(GlobalContext);
    const animation = useRef<AnimeInstance>();

    const scaleAnimation = useRef<AnimeInstance>();
    const scaleRef = useRef({scale: 1});

    useFrame(() => {
        // Rotate mesh every frame, this is outside of React without overhead
        animation.current = animation.current || anime({
            targets: mesh.current.rotation,
            x: 4,
            y: -4,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad',
            duration: 3000,
            autoplay: true,
            loopBegin() {
                setInfo();
            }
          });
        scaleAnimation.current = scaleAnimation.current || anime({
            targets: scaleRef.current,
                scale: 1.5,
                direction: 'normal',
                easing: 'easeInOutSine',
                duration: 1000,
        });
    });


    function handleClick() {
        const anime = scaleAnimation.current;
        if(!anime) return;
        const {completed, began, play, reverse, restart} = anime;

        // if(completed || (began && !completed)) reverse();
        // else play();
        restart();
    }
    
    return (
        <mesh
            {...props}
            ref={mesh}
            scale={scaleRef.current?.scale}
            onClick={handleClick}
            onPointerOver={(event) => setHover(true)}
            onPointerOut={(event) => setHover(false)}
        >
            <boxGeometry args={[1, 2, 3]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
};

function Scene() {
    const [warning, setWarning] = useState('');
    const [info, setInfo] = useState('');

    const lightPosition = useRef({x: 5, y: 5, z: 5});
    const animation = useRef<AnimeInstance>();
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        if(animation.current) return;
        animation.current = anime({
            targets: lightPosition.current,
            x: -5,
            y: -5,
            z: -5,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad',
            duration: 10000,
            autoplay: true,
          });
    });

    useEffect(function () {
        if (!WebGL.isWebGLAvailable()) {
            const warning = WebGL.getWebGLErrorMessage();
            setWarning(warning.innerText);
        } else {
            setWarning('WebGL is active.')
        }
    }, []);

    function handleStartRound() {
        setInfo(`${info}\nOne more round`)
    }

    const lightPositionVector = Object.values(lightPosition.current) as [number, number, number];

    return (
        <GlobalContext.Provider value={{setInfo: handleStartRound}}>
            {warning}
            {info}
            <ambientLight />
            <pointLight position={lightPositionVector} />
            <Box position={[-1.8, 0, 0]} />
            <Box position={[1.8, 0, 0]} />
        </GlobalContext.Provider>
    );
}

const CAMERA_DEFAULTS = {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5] as [number, number, number]
};

function View() {
    const animation = useRef<AnimeInstance>();
    const cameraRef = useRef({
        x: 0,
        y: 0,
        z: 5,
     });
     const [camera, setCamera] = useState(CAMERA_DEFAULTS);

     const callback = useCallback(function () {
        if(animation.current) return;
        animation.current = anime({
            targets: cameraRef.current,
            x: 0,
            y: 10,
            z: 10,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad',
            duration: 1000,
            autoplay: true,
            update() {
                setCamera({
                    ...camera,
                    position: Object.values(cameraRef.current) as [number, number, number],
                });
            }
          });
     }, [camera]);

    useEffect(callback, [callback]);

    return <Canvas camera={camera}><Scene/></Canvas>;
}

export default withRenderIfMounted(View);
