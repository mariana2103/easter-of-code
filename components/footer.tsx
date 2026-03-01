export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-[#050505] py-6 px-8 mt-auto font-mono">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
    
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-zinc-100 text-base font-bold tracking-tight">
            <span className="text-brand-violet">{"<"}</span>
            ACM FEUP
            <span className="text-brand-violet">{">"}</span>
          </div>
          
          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" /> 
          
          <span className="text-[10px] text-zinc-700 uppercase tracking-[0.2em] leading-none">
            © 2026 all rights reserved
          </span>
        </div>

        {/* Lado Direito: Contactos (Slightly larger icons) */}
        <div className="flex items-center gap-6">
          <a 
            href="mailto:geral@acmfeup.eu" 
            className="text-zinc-600 hover:text-brand transition-all duration-300 hover:scale-110"
            title="Email"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
          <a 
            href="https://instagram.com/acmfeup" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-600 hover:text-brand transition-all duration-300 hover:scale-110"
            title="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
}