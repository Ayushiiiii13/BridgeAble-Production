import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = 'inline-flex justify-center items-center px-6 py-3 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-bridgeable-blue text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:ring-bridgeable-blue',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-bridgeable-blue hover:text-bridgeable-blue hover:shadow focus:ring-slate-200',
        danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500',
        outline: 'bg-transparent text-bridgeable-navy border-2 border-bridgeable-navy py-2.5 hover:bg-bridgeable-navy hover:text-white focus:ring-bridgeable-navy'
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
