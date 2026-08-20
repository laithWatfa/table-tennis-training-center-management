// components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-shimmer rounded ${className}`} />;
}
