import Link from "next/link";
import { Users, Layers, Zap, Timer } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-800/70 via-slate-900 to-slate-800/70 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3B82F640,transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_70%_80%,#8B5CF640,transparent)]"></div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header Section */}
        <h1 className="text-center text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 mb-2 drop-shadow-lg tracking-wider font-orbitron">
          Quiz Versus
        </h1>
        <p className="text-center text-slate-400 mb-12 text-lg tracking-wide">
          Challenge your friends in real-time quiz battles!
        </p>

        {/* Features Section */}
        <div className="backdrop-blur-sm bg-white/5 rounded-3xl shadow-[0_0_30px_rgba(15,_23,_42,_0.3)] p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-semibold text-slate-300 mb-6 text-center tracking-wide font-orbitron">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-slate-200 text-lg">Up to 4 Players</span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-slate-200 text-lg">
                  Multiple Categories
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-slate-200 text-lg">
                  Real-time Battles
                </span>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 transition-all duration-300 hover:scale-105 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <Timer className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-slate-200 text-lg">
                  No Login Required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/game"
            className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-blue-400/40 shadow-lg"
          >
            Start Playing Now
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex justify-between items-center">
            <p className="text-slate-400 font-inter">
              Made for fun by{" "}
              <a
                href="https://github.com/kaanmetep"
                className="text-indigo-500 hover:text-indigo-400 transition-colors border-b border-indigo-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                me
              </a>
            </p>
            <p className="text-slate-400 font-inter">v1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
