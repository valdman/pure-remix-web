import {createContext, useContext, useEffect, useRef, useState} from 'react';
import type * as THREE from 'three';
import type { AnimeInstance } from 'animejs';
import anime from 'animejs';

import type {MeshProps} from '@react-three/fiber';
import {Canvas, useFrame} from '@react-three/fiber';

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
    const [active, setActive] = useState(false);
    
    const {setInfo} = useContext(GlobalContext);
    const animation = useRef<AnimeInstance>();
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        if(animation.current) return;
        animation.current = anime({
            targets: mesh.current.rotation,
            x: 10,
            y: -10,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad',
            duration: 3000,
            autoplay: true,
            loopBegin() {
                setInfo();
            }
          });
    });

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? 1.5 : 1}
            onClick={(event) => setActive(!active)}
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

    const lightPosition = useRef({x: 10, y: 10, z: 10});
    const animation = useRef<AnimeInstance>();
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        if(animation.current) return;
        animation.current = anime({
            targets: lightPosition.current,
            x: 0,
            y: 0,
            z: 0,
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

export default withRenderIfMounted(() => <Canvas><Scene/></Canvas>);
