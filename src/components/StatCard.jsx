import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-bridgeable-blue rounded-xl shrink-0">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
                <h4 className="text-3xl font-bold text-bridgeable-navy">{value}</h4>
                {trend && (
                    <p className="text-sm font-medium text-bridgeable-teal mt-2">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
