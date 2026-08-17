import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ear } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.loginUser(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Please enter both email and password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemo = async () => {
        setIsLoading(true);
        await api.loginUser('demo@example.com', 'password');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 mb-6 group">
                    <div className="bg-bridgeable-blue text-white p-2 rounded-xl group-hover:bg-bridgeable-navy transition-colors">
                        <Ear size={28} />
                    </div>
                    <span className="font-bold text-3xl text-bridgeable-navy tracking-tight">
                        Bridge<span className="text-bridgeable-teal">Able</span>
                    </span>
                </Link>
                <h2 className="text-center text-2xl font-bold text-slate-800 tracking-tight">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue transition-colors sm:text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue transition-colors sm:text-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-bridgeable-blue focus:ring-bridgeable-blue border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-bridgeable-blue hover:text-bridgeable-navy transition-colors">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                        <div>
                            <Button
                                type="submit"
                                className="w-full text-base py-3"
                                disabled={isLoading}
                            >
                                {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : 'Login'}
                            </Button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="button"
                                variant="secondary"
                                className="w-full text-base py-3"
                                onClick={handleDemo}
                                disabled={isLoading}
                            >
                                Continue as Demo User
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <p className="text-center text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-bridgeable-blue hover:text-bridgeable-navy transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
