import React from 'react';
import { Home, Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-indigo-950 text-white pt-24 pb-12 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-indigo-400 to-amber-400 opacity-20"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-900 rounded-full blur-[100px] opacity-20"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-900 rounded-full blur-[100px] opacity-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
                  <Home className="text-indigo-950" size={24} />
               </div>
               <span className="text-2xl font-black tracking-tighter">
                 Ghar<span className="text-amber-400">Mulya</span>
               </span>
            </div>
            <p className="text-indigo-200/60 font-medium leading-relaxed">
              India's premier AI-driven real estate intelligence platform. Empowering homeowners and investors with institutional-grade property insights.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-amber-400 hover:text-indigo-950 transition-all duration-300 border border-white/10">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-400">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-indigo-100/70 hover:text-white hover:translate-x-1 transition-all inline-block font-bold">Home Intelligence</Link></li>
              <li><Link to="/estimator" className="text-indigo-100/70 hover:text-white hover:translate-x-1 transition-all inline-block font-bold">Smart Estimator</Link></li>
              <li><Link to="/roi-planner" className="text-indigo-100/70 hover:text-white hover:translate-x-1 transition-all inline-block font-bold">ROI Strategy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-400">HQ Mumbai</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 group">
                <MapPin size={20} className="text-indigo-400 group-hover:text-amber-400 transition-colors shrink-0" />
                <span className="text-indigo-100/70 font-bold">12th Floor, Maker Chambers VI, Nariman Point, Mumbai, MH 400021</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone size={20} className="text-indigo-400 group-hover:text-amber-400 transition-colors shrink-0" />
                <span className="text-indigo-100/70 font-bold">+91 22 4567 8900</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail size={20} className="text-indigo-400 group-hover:text-amber-400 transition-colors shrink-0" />
                <span className="text-indigo-100/70 font-bold">concierge@gharmulya.in</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-amber-400">Market Brief</h4>
            <p className="text-indigo-100/60 text-xs font-bold mb-6">Receive elite market analysis and price trends directly to your inbox.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="vip@domain.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder:text-white/20"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-amber-400 text-indigo-950 px-4 rounded-xl hover:bg-white transition-colors duration-300">
                 <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black text-indigo-300/40 tracking-widest uppercase">
            © 2024 GharMulya Intelligence Systems. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-indigo-300/40">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Charter</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
