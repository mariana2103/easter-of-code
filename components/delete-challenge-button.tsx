'use client';

export function DeleteChallengeButton({ title }: { title: string }) {
  return (
    <button
      type="submit"
      className="font-mono text-xs text-red-500/60 hover:text-red-400 transition-colors"
      onClick={(e) => {
        if (!confirm(`Delete "${title}"?`)) {
          e.preventDefault();
        }
      }}
    >
      rm()
    </button>
  );
}