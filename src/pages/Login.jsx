import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShoppingBag,
  Settings,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [bShowPassword, setShowPassword] = useState(false);
  const [oFormData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [sError, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const dummyCredentials = {
      email: 'vijay@b2y.com',
      password: 'demo123'
    };
    try {
      if (
        oFormData.email === dummyCredentials.email &&
        oFormData.password === dummyCredentials.password
      ) {
        const dummyToken = 'dummy-jwt-token-123456';
        localStorage.setItem('token', dummyToken);
        if (oFormData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Try demo@example.com / demo123');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-custom-bg to-blue-300">
      {/* Left Panel - Admin Info with Enhanced Styles */}
      <div className="hidden lg:flex flex-col justify-center items-center px-12 bg-custom-bg/50 text-white relative overflow-hidden">
         {/* Subtle background pattern - add pattern classes here if available */}
         <div className="absolute inset-0 bg-repeat opacity-20" style={{ backgroundImage: 'url("/path/to/subtle-pattern.png")' }}></div> {/* Example pattern overlay */}

        <div className="text-center max-w-md animate-fade-in z-10 relative">
          <Settings className="w-14 h-14 text-white mb-6 mx-auto drop-shadow-md" /> {/* Larger icon and centered */}
          <h1 className="text-4xl font-bold mb-5 leading-tight drop-shadow-md">
            Admin Portal <br/> Management System
          </h1>
          <p className="text-white/90 text-lg mb-10 drop-shadow-sm">
            Efficiently manage your e-commerce operations with our comprehensive admin tools.
          </p>

          {/* Admin Feature List */}
          <div className="grid grid-cols-1 gap-4 text-left text-sm mt-8">
            <div className="flex items-center space-x-3 drop-shadow-sm">
              <Package className="h-5 w-5 text-white" />
              <span>Product Management</span>
            </div>
            <div className="flex items-center space-x-3 drop-shadow-sm">
              <ShoppingCart className="h-5 w-5 text-white" />
              <span>Order Fulfillment</span>
            </div>
            <div className="flex items-center space-x-3 drop-shadow-sm">
              <Users className="h-5 w-5 text-white" />
              <span>User & Role Management</span>
            </div>
            <div className="flex items-center space-x-3 drop-shadow-sm">
              <BarChart2 className="h-5 w-5 text-white" />
              <span>Sales Analytics</span>
            </div>
             <div className="flex items-center space-x-3 drop-shadow-sm">
              <Shield className="h-5 w-5 text-white" />
              <span>Security & Settings</span>
            </div>
          </div>

        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl border border-custom-bg/30 rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(255,90,95,0.35)] transition-all hover:scale-[1.02]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-custom-bg text-white rounded-xl shadow">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Welcome back</h2>
            <p className="text-sm text-gray-600">Login to your account</p>
          </div>

          {sError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
              {sError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-white/80 focus:ring-4 focus:ring-custom-bg/40 focus:border-custom-bg focus:outline-none text-sm transition-all duration-200"
                  placeholder="you@example.com"
                  value={oFormData.email}
                  onChange={e => setFormData({ ...oFormData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  type={bShowPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white/80 focus:ring-4 focus:ring-custom-bg/40 focus:border-custom-bg focus:outline-none text-sm transition-all duration-200"
                  placeholder="Password"
                  value={oFormData.password}
                  onChange={e => setFormData({ ...oFormData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute top-2.5 right-3 text-gray-500 hover:text-custom-bg"
                  aria-label={bShowPassword ? 'Hide password' : 'Show password'}
                >
                  {bShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={oFormData.rememberMe}
                  onChange={e => setFormData({ ...oFormData, rememberMe: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-custom-bg"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Forgot password?')}
                className="text-custom-bg hover:underline hover:text-red-500 transition-all duration-200"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-2 bg-custom-bg text-white font-semibold rounded-lg shadow-lg hover:bg-red-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
