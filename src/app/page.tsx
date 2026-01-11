import { TradeEntryForm } from "@/components/journal/TradeEntryForm";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 text-white p-2 rounded-lg font-black text-xl leading-none">J</div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">JOURNALY</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-slate-900">Dashboard</Link>
            <Link href="/settings" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <TradeEntryForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400 font-medium italic">Powered by Supabase & Storage Portability</p>
        </div>
      </footer>
    </div>
  );
}
