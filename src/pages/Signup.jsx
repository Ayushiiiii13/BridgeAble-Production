import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ear } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        preference: 'All'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.signupUser({
                name: formData.name,
                email: formData.email,
                prefs: formData.preference
            });
            navigate('/dashboard');
        } catch (err) {
            setError('An error occurred during sign up.');
        } finally {
            setIsLoading(false);
        }
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
                <h2 className="text-center text-2xl font-bold text-slate-800 tracking-tight">Create your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
                    <form className="space-y-5" onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <div className="mt-1">
                                <input id="name" name="name" type="text" required
                                    value={formData.name} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue sm:text-sm transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue sm:text-sm transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <div className="mt-1">
                                <input id="confirmPassword" name="confirmPassword" type="password" required
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="preference" className="block text-sm font-medium text-slate-700 mb-2">Preferred Communication</label>
                            <select
                                id="preference" name="preference"
                                value={formData.preference} onChange={handleChange}
                                className="block w-full pl-3 pr-10 py-3 text-base border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue sm:text-sm rounded-xl transition-colors"
                            >
                                <option>All</option>
                                <option>Sign Language</option>
                                <option>Speech</option>
                                <option>Text</option>
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                        <div className="pt-2">
                            <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
                                {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : 'Create Account'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-bridgeable-blue hover:text-bridgeable-navy transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
