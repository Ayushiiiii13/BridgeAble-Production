import React from 'react';
import { ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, to, onClick }) => {
    return (
        <div
            className="glass-card rounded-2xl p-6 group hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
            onClick={onClick}
        >
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-bridgeable-blue transition-colors">
                <Icon className="text-bridgeable-blue group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="text-xl font-bold text-bridgeable-navy mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed flex-grow">{description}</p>

            <div className="mt-6 flex items-center text-sm font-semibold text-bridgeable-blue group-hover:text-bridgeable-teal transition-colors">
                Try now <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};

export default FeatureCard;
