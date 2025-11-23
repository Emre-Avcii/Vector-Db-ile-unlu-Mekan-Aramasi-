import React, { useState, useCallback } from 'react';

interface UploadProps {
    onUpload: (file: File) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    }, [onUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className={`relative group p-12 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden
                ${isDragging
                    ? 'bg-cyber-primary/10 border-cyber-primary shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                    : 'bg-white/5 border-white/10 hover:border-cyber-secondary/50 hover:bg-white/10'
                } border-2 border-dashed`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <input
                type="file"
                className="hidden"
                id="file-upload"
                accept="image/png, image/jpeg"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer relative z-10 flex flex-col items-center justify-center space-y-4">
                <div className={`p-6 rounded-full bg-white/50 transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-primary/10 ${isDragging ? 'animate-pulse-soft' : ''}`} >
                    <img
                        src="/logo.jpg"
                        alt="Upload"
                        className="w-20 h-20 object-contain animate-float drop-shadow-xl"
                    />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-brand-dark group-hover:text-brand-primary transition-colors">
                        Görseli Buraya Bırak
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">veya seçmek için tıkla</p>
                </div>
            </label>
        </div>
    );
};

export default Upload;
