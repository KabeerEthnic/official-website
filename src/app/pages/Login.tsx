import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export function Login() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E89B3C]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="text-center mb-10 relative">
          <h1 
            className="text-4xl text-white mb-2"
            style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
          >
            Welcome Back
          </h1>
          <p className="text-white/60 text-sm">Enter your details to access your account</p>
        </div>

        <form className="space-y-6 relative">
          <div>
            <label className="block text-white/70 text-sm mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" 
              placeholder="your@email.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white/70 text-sm">Password</label>
              <a href="#" className="text-xs text-[#E89B3C] hover:text-white transition-colors">Forgot Password?</a>
            </div>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" 
              placeholder="••••••••"
            />
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6 relative">
          <p className="text-white/60 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E89B3C] hover:text-white transition-colors font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
