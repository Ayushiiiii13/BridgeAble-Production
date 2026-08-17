import React from 'react';

const EmergencyCard = ({ title, icon: Icon, color = 'bg-red-500', onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full group p-6 rounded-2xl border-2 border-transparent hover:border-red-500 bg-white shadow-sm hover:shadow-lg transition-all text-left flex items-center gap-4 focus:outline-none focus:ring-4 focus:ring-red-500/20`}
        >
            <div className={`p-4 rounded-xl text-white ${color} group-hover:-translate-y-1 transition-transform`}>
                <Icon size={32} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-500 transition-colors uppercase tracking-wide">
                    {title}
                </h3>
                <p className="text-slate-500 mt-1 font-medium">Click to broadcast message</p>
            </div>
        </button>
    );
};

export default EmergencyCard;
