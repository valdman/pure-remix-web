import {useEffect, useState} from 'react';
import type {ReactElement} from 'react';

export function withRenderIfMounted<T>(Component: () => ReactElement<T>) {
    return function RenderIfMount(props: T): ReactElement | null {
        const [hasMounted, setHasMounted] = useState(false);

        useEffect(() => {
            setHasMounted(true);
        }, []);

        if (!hasMounted) return null;

        return <Component {...props} />;
    };
}
