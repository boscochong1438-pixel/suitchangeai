
import React from 'react';

interface ImagePlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600">
    <div className="text-gray-500 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
    <p className="text-sm text-gray-400 mt-1">{description}</p>
  </div>
);
