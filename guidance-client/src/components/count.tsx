import React from 'react';

interface CountCardProps {
    title: string;
    count: number;
    color: string;
}

const CountCard: React.FC<CountCardProps> = ({ title, count, color }) => {
    return (
        <div style={{ backgroundColor: `#${color}` }} className="w-full text-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col justify-center items-start mb-3">
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="flex flex-row justify-start items-center mr-10">
                <p className="text-2xl font-semibold">{count} Students</p>
            </div>
        </div>
    );
};

export default CountCard;
