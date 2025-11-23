import React, { useState } from 'react';
import Upload from '../components/Upload';
import Map from '../components/Map';
import Results from '../components/Results';
import { searchByImage, searchByText, getBenchmark } from '../services/api';
import type { Landmark, BenchmarkResult } from '../types';

const Search: React.FC = () => {
    const [results, setResults] = useState<Landmark[]>([]);
    const [loading, setLoading] = useState(false);
    const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
    const [searchType, setSearchType] = useState<'image' | 'text'>('image');
    const [textQuery, setTextQuery] = useState('');

    // Mock data for fallback
    const mockResults: Landmark[] = [
        {
            id: 1,
            name: "Eiffel Tower 🗼",
            description: "The Iron Lady of Paris, a symbol of romance and engineering marvel.",
            latitude: 48.8584,
            longitude: 2.2945,
            image_url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce7859?auto=format&fit=crop&w=800&q=80",
            distance_km: 0.0,
            similarity_score: 0.98
        },
        {
            id: 2,
            name: "Statue of Liberty 🗽",
            description: "A colossal neoclassical sculpture on Liberty Island in New York Harbor.",
            latitude: 40.6892,
            longitude: -74.0445,
            image_url: "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80",
            distance_km: 5834.0,
            similarity_score: 0.85
        },
        {
            id: 3,
            name: "Colosseum 🏟️",
            description: "An oval amphitheatre in the centre of the city of Rome, Italy.",
            latitude: 41.8902,
            longitude: 12.4922,
            image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
            distance_km: 1105.0,
            similarity_score: 0.78
        }
    ];

    // Default user location (e.g., Paris for demo)
    const userLat = 48.8566;
    const userLon = 2.3522;

    const handleImageUpload = async (file: File) => {
        setLoading(true);
        try {
            const data = await searchByImage(file, 5, 10, userLat, userLon);
            setResults(data);

            // Trigger benchmark
            const bench = await getBenchmark("image search");
            setBenchmark(bench);
        } catch (error) {
            console.error("Search failed, using mock data", error);
            // Fallback to mock data
            setTimeout(() => {
                setResults(mockResults);
                setLoading(false);
            }, 1500); // Fake delay
        } finally {
            if (!results.length) setLoading(false); // Only stop loading if not using mock timeout
        }
    };

    const handleTextSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchByText(textQuery, 5, userLat, userLon);
            setResults(data);

            const bench = await getBenchmark(textQuery);
            setBenchmark(bench);
        } catch (error) {
            console.error("Search failed, using mock data", error);
            // Fallback to mock data
            setTimeout(() => {
                setResults(mockResults);
                setLoading(false);
            }, 1000);
            if (!results.length) setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl relative z-10">
            {/* Top Section: Search & Upload */}
            <div className="glass-panel p-8 rounded-4xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-80"></div>

                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100/50 p-1.5 rounded-2xl inline-flex shadow-inner">
                        <button
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${searchType === 'image'
                                    ? 'bg-white text-brand-primary shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setSearchType('image')}
                        >
                            📸 Görsel ile Ara
                        </button>
                        <button
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${searchType === 'text'
                                    ? 'bg-white text-brand-secondary shadow-md transform scale-105'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setSearchType('text')}
                        >
                            🔍 İsim ile Ara
                        </button>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto transition-all duration-500 ease-in-out">
                    {searchType === 'image' ? (
                        <Upload onUpload={handleImageUpload} />
                    ) : (
                        <form onSubmit={handleTextSearch} className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={textQuery}
                                    onChange={(e) => setTextQuery(e.target.value)}
                                    placeholder="Örn: Eyfel Kulesi, Özgürlük Heykeli..."
                                    className="glass-input w-full pl-14 py-5 text-lg shadow-sm group-hover:shadow-md transition-shadow"
                                />
                                <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-2xl grayscale group-hover:grayscale-0 transition-all">
                                    🌍
                                </span>
                            </div>
                            <button type="submit" className="glass-button w-full py-4 text-lg font-bold tracking-wide group overflow-hidden relative">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    KEŞFETMEYE BAŞLA 🚀
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Middle Section: Map */}
            <div className="glass-panel p-2 rounded-4xl overflow-hidden mb-8 h-[500px] shadow-xl shadow-brand-primary/10 relative z-0">
                <Map landmarks={results} />
            </div>

            {/* Bottom Section: Results */}
            <div className="space-y-6">
                {loading ? (
                    <div className="glass-panel p-12 rounded-3xl text-center">
                        <div className="inline-block relative">
                            <div className="w-20 h-20 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
                                🤖
                            </div>
                        </div>
                        <p className="mt-6 text-brand-dark font-medium text-lg animate-pulse">Sihirli küre çalışıyor...</p>
                    </div>
                ) : results.length > 0 ? (
                    <Results results={results} onSelect={(l) => console.log("Drill down:", l)} />
                ) : (
                    !loading && (
                        <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                            <img src="/mascot_sad.png" alt="Sad Mascot" className="w-32 h-32 mb-6 animate-float" />
                            <h3 className="text-2xl font-bold text-brand-dark mb-2">Üzgünüm, bir şey bulamadım... 😔</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Aradığın kriterlere uygun bir yer bulamadım. Belki başka bir isim deneyebilirsin?
                                <br />
                                <em>"Hata yapmak, keşfetmenin yarısıdır!" - BulBot</em>
                            </p>
                        </div>
                    )
                )}
            </div>

            {benchmark && (
                <div className="mt-12 text-center opacity-50 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-mono text-gray-400">
                        Sistem Performansı: Qdrant {benchmark.qdrant.latency_ms.toFixed(0)}ms | Milvus {benchmark.milvus.latency_ms.toFixed(0)}ms
                    </p>
                </div>
            )}
        </div>
    );
};

export default Search;
