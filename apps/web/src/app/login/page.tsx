// Simple Login Page for CISPA Platform
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (testEmail: string) => {
    setError('');
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'testpassword123',
      });

      if (error) throw error;
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Test login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">CISPA Platform</h1>
        <h2 className="text-center text-xl text-gray-600 mb-8">Sign in to your account</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Test Login Buttons */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Quick Test Login:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleTestLogin('advisor@test.com')}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Logging in...' : 'Login as Advisor'}
              </button>
              <button
                onClick={() => handleTestLogin('founder@startup.com')}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Logging in...' : 'Login as Founder'}
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use email/password</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Demo credentials: advisor@test.com / testpassword123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}