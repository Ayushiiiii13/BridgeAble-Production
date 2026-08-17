import React from 'react';

const PageHeader = ({ title, description, icon: Icon, color = 'bg-bridgeable-blue', textColor = 'text-bridgeable-blue' }) => {
    return (
        <div className="mb-8 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center shrink-0`}>
                <Icon size={32} className={textColor} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-bridgeable-navy mb-2 tracking-tight">{title}</h1>
                <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export default PageHeader;
