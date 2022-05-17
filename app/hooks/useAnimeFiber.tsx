import {useMemo, useRef, useState} from 'react';
import {useFrame} from '@react-three/fiber';
import type {AnimeInstance, AnimeParams} from 'animejs';
import anime from 'animejs';

export function useAnimeFiber<T>(params: AnimeParams, defaultState: T): [T, AnimeInstance | null];

export function useAnimeFiber(params: AnimeParams): [null, AnimeInstance | null];

export function useAnimeFiber<T>(params: AnimeParams, defaultState?: T | null): [T | null, AnimeInstance | null] {
    const animationRef = useRef<AnimeInstance>(null!);
    const stateRef = useRef(defaultState);
    const [state, setState] = useState(defaultState);

    const refTarget = useMemo(() => (stateRef.current ? [stateRef.current] : []), []);

    const targets = useMemo(
        () =>
            Array.isArray(params.targets)
                ? [...refTarget, ...params.targets]
                : [...refTarget, ...(params.targets ? [params.targets] : [])],
        [params.targets, refTarget],
    );

    useFrame(() => {
        if (animationRef.current) return;
        animationRef.current = anime({
            ...params,
            targets,
            update(...args) {
                const newState = (() => {
                    if (typeof stateRef?.current === 'object') {
                        return {...stateRef.current} as T;
                    }
                    return stateRef.current;
                })();
                setState(newState);
                if (params.update) return params.update(...args);
            },
        });
    });

    return [state || null, animationRef.current];
}
