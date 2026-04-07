import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../redux/authSlice';
import { authAPI, primeApiConnection } from '../services/api';
import { toast } from 'react-toastify';
import OnboardingWizard from '../components/OnboardingWizard';
import { preloadCommonDashboards, preloadDashboardByRole } from '../utils/routePreload';
import { ArrowRight, BarChart3, Lightbulb, TrendingUp, ShieldCheck, Zap, Home as HomeIcon, Layers, Palette } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    primeApiConnection();
    preloadCommonDashboards();
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const handleDemoLogin = async (role) => {
    dispatch(setLoading(true));
    try {
      preloadDashboardByRole(role);
      const demoCredentials = {
        user: { email: 'user@demo.com', password: 'User@123456' },
        admin: { email: 'admin@demo.com', password: 'Admin@123456' },
      };
      const credentials = demoCredentials[role];
      const response = await authAPI.login(credentials);
      dispatch(setUser(response.data));
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} Demo Login successful!`);
      navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || `${role} demo login failed.`;
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/modern_indian_home_interior_1775538259277.png" 
            alt="Premium Home Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo/90 via-indigo/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full text-white">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
            <h1 className="text-5xl md:text-7xl serif font-bold mb-6 leading-tight">
              Unlock the <span className="text-gold">True Value</span> of Your Home
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed font-light">
              Get data-driven enhancement recommendations tailored for the Indian market. Maximize your ROI with expert insights.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/register')} className="btn btn-gold py-4 px-8 text-lg">
                Start Analysis <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/recommendations')} className="btn btn-outline border-white text-white hover:bg-white hover:text-indigo py-4 px-8 text-lg">
                View Samples
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="bg-indigo py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 text-white/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gold">10k+</span>
            <span className="text-sm uppercase tracking-widest font-semibold">Homes Evaluated</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gold">₹50Cr+</span>
            <span className="text-sm uppercase tracking-widest font-semibold">Value Added</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gold">4.9/5</span>
            <span className="text-sm uppercase tracking-widest font-semibold">User Satisfaction</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl serif font-bold text-indigo mb-4">Why GharMulya?</h2>
            <div className="h-1 w-24 bg-gold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="card text-center p-10">
              <div className="w-16 h-16 bg-indigo/5 rounded-2xl flex items-center justify-center text-indigo mx-auto mb-6">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-indigo">Market Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                We analyze hyper-local real estate trends across Indian metro cities to give you precise estimates.
              </p>
            </div>

            <div className="card text-center p-10">
              <div className="w-16 h-16 bg-indigo/5 rounded-2xl flex items-center justify-center text-indigo mx-auto mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-indigo">ROI Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Know exactly which upgrades pay off. We focus on enhancements that offer the highest capital appreciation.
              </p>
            </div>

            <div className="card text-center p-10">
              <div className="w-16 h-16 bg-indigo/5 rounded-2xl flex items-center justify-center text-indigo mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-indigo">Trusted Guidance</h3>
              <p className="text-gray-600 leading-relaxed">
                Step-by-step guidance from vetting contractors to choosing the right materials for the climate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl serif font-bold text-indigo mb-4">Enhancement Categories</h2>
              <p className="text-gray-600 text-lg">Specialized areas to focus your renovation efforts for maximum impact.</p>
            </div>
            <button onClick={() => navigate('/recommendations')} className="text-indigo font-bold flex items-center gap-2 group">
              Browse All Categories <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: <Layers />, name: 'Kitchen & Bath', desc: 'Modern fittings' },
              { icon: <Zap />, name: 'Smart Energy', desc: 'Solar & Savings' },
              { icon: <Palette />, name: 'Interior Paint', desc: 'Premium Finishes' },
              { icon: <HomeIcon />, name: 'Exterior Facade', desc: 'Curb Appeal' },
            ].map((cat, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="card p-8 group-hover:bg-indigo group-hover:text-white h-full transition-all duration-300">
                  <div className="mb-4 text-indigo group-hover:text-gold transition-colors">{cat.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{cat.name}</h4>
                  <p className="text-sm opacity-70">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-cream">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-indigo rounded-3xl p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl serif font-bold mb-6">Experience the Platform</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Explore the dashboard with pre-configured demo accounts. No sign-up required.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button 
                  onClick={() => handleDemoLogin('user')}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 p-6 rounded-2xl flex flex-col items-center transition-all group"
                >
                  <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">👤</span>
                  <span className="text-xl font-bold">User Demo</span>
                  <span className="text-sm opacity-60 mt-1">Property Mgmt</span>
                </button>

                <button 
                  onClick={() => handleDemoLogin('admin')}
                  className="bg-gold text-indigo p-6 rounded-2xl flex flex-col items-center transition-all group"
                >
                  <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">👨‍💼</span>
                  <span className="text-xl font-bold">Admin Demo</span>
                  <span className="text-sm opacity-80 mt-1">Full Analytics</span>
                </button>
              </div>
            </div>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo/10 rounded-full blur-3xl shadow-white/5" />
          </div>
        </div>
      </section>

      {/* Pre-footer CTA */}
      <section className="py-24 bg-white border-t border-indigo/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl serif font-bold text-indigo mb-8">Ready to Elevate Your Living Space?</h2>
          <button onClick={() => navigate('/register')} className="btn btn-primary py-4 px-12 text-xl shadow-xl">
            Join GharMulya Today
          </button>
        </div>
      </section>

      <OnboardingWizard isOpen={showOnboarding} onClose={handleOnboardingClose} />
    </div>
  );
};

export default Home;

