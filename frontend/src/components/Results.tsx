import React from 'react';
import type { Landmark } from '../types';

interface ResultsProps {
    results: Landmark[];
    onSelect: (landmark: Landmark) => void;
}

const Results: React.FC<ResultsProps> = ({ results, onSelect }) => {
    if (results.length === 0) {
        return <div className="text-center text-gray-400 mt-8 font-mono animate-pulse">Waiting for scan results...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {results.map((landmark, index) => (
                <div
                    key={landmark.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-brand-primary/20 transition-all duration-300 cursor-pointer group hover:-translate-y-2 animate-slide-up border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                        alert(`🔍 "${landmark.name}" için detaylı analiz ve benzer yerler aranıyor... (Mock)`);
                        onSelect(landmark);
                    }}
                >
                    <div className="relative h-56 overflow-hidden">
                        <img
                            src={landmark.image_url}
                            alt={landmark.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h3 className="font-display font-bold text-xl text-white truncate flex items-center gap-2">
                                {landmark.name}
                            </h3>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-gray-400 flex items-center gap-1">
                                📏 Mesafe
                            </span>
                            <span className="text-brand-dark bg-gray-100 px-3 py-1 rounded-full">
                                {landmark.distance_km.toFixed(2)} km
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Benzerlik</span>
                                <span className="text-brand-primary font-bold">{(landmark.similarity_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                                    style={{ width: `${landmark.similarity_score * 100}%` }}
                                />
                            </div>
                        </div>
                        {landmark.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                {landmark.description}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Results;
