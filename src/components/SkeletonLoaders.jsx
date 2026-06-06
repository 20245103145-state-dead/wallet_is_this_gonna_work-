import React from 'react';

export function SkeletonChart() {
    return (
        <div style={{ height: "300px", width: "100%", background: "linear-gradient(90deg, var(--skel-base) 25%, var(--skel-shine) 50%, var(--skel-base) 75%)", backgroundSize: "200% 100%", animation: "skeleton-loading 1.5s infinite", borderRadius: "12px" }}>
            <style>{`
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div style={{ width: "100%" }}>
            {[...Array(rows)].map((_, i) => (
                <div key={i} style={{ 
                    height: "40px", 
                    width: "100%", 
                    background: "linear-gradient(90deg, var(--skel-base) 25%, var(--skel-shine) 50%, var(--skel-base) 75%)", 
                    backgroundSize: "200% 100%", 
                    animation: "skeleton-loading 1.5s infinite", 
                    borderRadius: "8px", 
                    marginBottom: "8px" 
                }} />
            ))}
        </div>
    );
}
