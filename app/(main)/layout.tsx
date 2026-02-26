import { Nav } from "@/components/nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-800/60 py-6 text-center font-mono text-xs text-zinc-700">
        <span className="text-zinc-800">{"// "}</span>
        acm{"{"}<span className="text-zinc-600">hack</span>{"}"}{" "}
        <span className="text-zinc-800">— built with</span>{" "}
        <span className="text-zinc-600">next.js + cloudflare</span>
      </footer>
    </div>
  );
}
