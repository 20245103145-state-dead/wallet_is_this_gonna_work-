import { useState, useEffect } from 'react';

export function useCountUp(target, ms = 800) {
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!target) return;
        
        let start = 0;
        const step = target / (ms / 16);
        
        const t = setInterval(() => {
            if (target > 0) {
                start = Math.min(start + step, target);
            } else {
                start = Math.max(start + step, target);
            }
            setVal(Math.round(start));
            
            if ((target > 0 && start >= target) || (target < 0 && start <= target) || target === 0) clearInterval(t);
        }, 16);
        
        return () => clearInterval(t);
    }, [target, ms]);

    return val;
}
