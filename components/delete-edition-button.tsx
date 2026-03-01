'use client';

export function DeleteEditionButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      className="font-mono text-xs text-red-500/60 hover:text-red-400 transition-colors"
      onClick={(e) => {
        if (!confirm(`Delete edition "${name}" and all its challenges?`)) {
          e.preventDefault();
        }
      }}
    >
      rm()
    </button>
  );
}
