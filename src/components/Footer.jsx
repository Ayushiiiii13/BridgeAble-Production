import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <span className="font-bold text-xl text-bridgeable-navy tracking-tight">
                            Bridge<span className="text-bridgeable-teal">Able</span>
                        </span>
                        <p className="mt-2 text-sm text-slate-500">Breaking barriers. Building connections.</p>
                    </div>
                    <div className="flex space-x-6">
                        <span className="text-sm text-slate-500 hover:text-bridgeable-navy cursor-pointer transition-colors">Privacy</span>
                        <span className="text-sm text-slate-500 hover:text-bridgeable-navy cursor-pointer transition-colors">Terms</span>
                        <span className="text-sm text-slate-500 hover:text-bridgeable-navy cursor-pointer transition-colors">Accessibility</span>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200 flex justify-center">
                    <p className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} BridgeAble. All rights reserved. (Demo App)
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
