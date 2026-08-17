import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Ear } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Learn', path: '/learn' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-bridgeable-blue text-white p-2 rounded-xl group-hover:bg-bridgeable-navy transition-colors">
                                <Ear size={24} />
                            </div>
                            <span className="font-bold text-2xl text-bridgeable-navy tracking-tight">
                                Bridge<span className="text-bridgeable-teal">Able</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex space-x-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors ${isActive(link.path) ? 'text-bridgeable-blue' : 'text-slate-600 hover:text-bridgeable-navy'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-bridgeable-navy transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="bg-bridgeable-navy text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-bridgeable-blue transition-colors shadow-sm">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 hover:text-bridgeable-navy p-2"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
                    <div className="px-4 py-4 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path) ? 'text-bridgeable-blue bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
                            <Link to="/login" className="block text-center px-4 py-2 border border-slate-200 rounded-full text-base font-medium text-slate-600 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                                Login
                            </Link>
                            <Link to="/signup" className="block text-center px-4 py-2 rounded-full text-base font-medium text-white bg-bridgeable-navy hover:bg-bridgeable-blue" onClick={() => setIsOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
