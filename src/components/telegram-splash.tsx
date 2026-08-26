import { Send } from "lucide-react";

export function TelegramSplash() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121826] border border-white/10 rounded-3xl p-8 text-center space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Send className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-4">
            We're on Telegram!
          </h1>
          
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            The MilkyTech Web Version is currently closed. To participate in our prize campaigns and manage your account, please use our official Telegram Mini App.
          </p>

          <a 
            href="https://t.me/milkytechonlinebot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Send className="w-5 h-5" />
            Open Telegram App
          </a>
        </div>
      </div>
      
      <div className="mt-12 text-slate-500 text-sm font-medium flex gap-6">
        <a href="/admin" className="hover:text-slate-300 transition-colors">Admin Login</a>
        <a href="#" className="hover:text-slate-300 transition-colors">Help Center</a>
      </div>
    </div>
  );
}
