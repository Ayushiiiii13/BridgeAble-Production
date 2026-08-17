import React from 'react';

const ConversationBubble = ({ message, isSigner = false, timestamp }) => {
    return (
        <div className={`flex w-full mb-6 ${isSigner ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${isSigner
                    ? 'bg-bridgeable-blue text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}>
                <div className="flex items-center mb-1">
                    <span className={`text-xs font-semibold ${isSigner ? 'text-blue-100' : 'text-slate-500'}`}>
                        {isSigner ? 'Signer' : 'Speaker'}
                    </span>
                    {timestamp && (
                        <span className={`text-[10px] ml-2 font-medium ${isSigner ? 'text-blue-200' : 'text-slate-400'}`}>
                            {timestamp}
                        </span>
                    )}
                </div>
                <p className="text-base leading-relaxed">{message}</p>
            </div>
        </div>
    );
};

export default ConversationBubble;
