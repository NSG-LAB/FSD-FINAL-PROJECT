import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-indigo text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl serif font-bold text-white mb-4 block">
              Ghar<span className="text-gold">Mulya</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering Indian homeowners with data-driven insights to maximize their property value through smart enhancements.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/recommendations" className="text-gray-300 hover:text-white transition-colors">Recommendations</Link></li>
              <li><Link to="/roi-planner" className="text-gray-300 hover:text-white transition-colors">ROI Calculator</Link></li>
              <li><Link to="/valuation" className="text-gray-300 hover:text-white transition-colors">Valuation</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-gold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">Kitchen & Bath</li>
              <li className="text-gray-300">Smart Energy</li>
              <li className="text-gray-300">Exterior Design</li>
              <li className="text-gray-300">Safety Systems</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold text-lg mb-4">Newsletter</h4>
            <p className="text-gray-300 text-sm mb-4">Stay updated with latest property trends.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/10 border border-white/20 px-4 py-2 rounded-l-md w-full focus:outline-none focus:border-gold"
              />
              <button className="bg-gold text-indigo px-4 py-2 rounded-r-md font-bold hover:bg-white transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} GharMulya PropTech. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Built for the Indian Middle Class Homeowner.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
