
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Wallet, Camera, User as UserIcon, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: isLogin ? 'Demo User' : name,
        email: email,
        profileImage: selectedAvatar
      };
      
      // Save to simulate "Session"
      localStorage.setItem('user', JSON.stringify(newUser));
      onLogin(newUser);
      setLoading(false);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Hero */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             </svg>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
               <Wallet className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Master Your Money</h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Track your income, manage expenses, and get AI-powered financial advice to grow your wealth.
            </p>
          </div>

          <div className="relative z-10 flex gap-4 text-sm font-medium text-indigo-200">
             <span>• Smart Tracking</span>
             <span>• Secure</span>
             <span>• Free</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isLogin ? 'Enter your details to access your account' : 'Start your financial journey today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="mb-6 flex flex-col items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img 
                    src={selectedAvatar} 
                    alt="Profile Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 shadow-lg transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                    <Camera size={16} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">Upload a photo or choose an avatar</p>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-full px-2">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative rounded-full p-1 border-2 transition-all shrink-0 ${selectedAvatar === avatar ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <img src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && (
               <div className="relative group">
                 <UserIcon size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                   type="text" 
                   required 
                   placeholder="Full Name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all" 
                 />
               </div>
            )}
            
            <div className="relative group">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="email" 
                required 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all" 
              />
            </div>
            
            <div className="relative group">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="password" 
                required 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 outline-none transition-all" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Processing...' : (isLogin ? 'LOGIN' : 'Create Account')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold ml-1"
              >
                {isLogin ? "Sign Up" : "LOGIN"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
