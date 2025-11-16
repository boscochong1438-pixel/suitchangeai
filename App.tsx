
import React, { useState, useRef, useCallback } from 'react';
import { ImageFile } from './types';
import { editImageWithPrompt } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { ImagePlaceholder } from './components/ImagePlaceholder';
import { UploadIcon, SparklesIcon, ImageIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, url: reader.result as string });
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Data = originalImage.url.split(',')[1];
      const mimeType = originalImage.file.type;
      const resultBase64 = await editImageWithPrompt(base64Data, mimeType, prompt);
      setEditedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 font-sans">
      <header className="p-4 border-b border-gray-700/50 text-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          AI Image Editor
        </h1>
        <p className="text-sm text-gray-400">Edit images with text prompts powered by Gemini</p>
      </header>
      
      <main className="flex-grow p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Original Image Pane */}
        <div className="flex flex-col aspect-square w-full bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-3 bg-gray-700/50 text-sm font-semibold text-gray-300 border-b border-gray-700">Original</div>
          <div className="flex-grow flex items-center justify-center p-4">
            {originalImage ? (
              <img src={originalImage.url} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
              <button onClick={triggerFileSelect} className="w-full h-full">
                <ImagePlaceholder
                  icon={<UploadIcon className="w-12 h-12" />}
                  title="Upload an Image"
                  description="Click here to select an image file to edit."
                />
              </button>
            )}
          </div>
        </div>

        {/* Edited Image Pane */}
        <div className="flex flex-col aspect-square w-full bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-3 bg-gray-700/50 text-sm font-semibold text-gray-300 border-b border-gray-700">Edited with AI</div>
          <div className="flex-grow flex items-center justify-center p-4">
            {isLoading && <Spinner />}
            {!isLoading && editedImage && (
              <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded-lg" />
            )}
            {!isLoading && !editedImage && (
               <ImagePlaceholder
                icon={<ImageIcon className="w-12 h-12" />}
                title="Your Edited Image"
                description="The result of your prompt will appear here."
              />
            )}
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-700/50">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Change the red shirt to blue' or 'Add a retro film grain effect'"
              className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex w-full sm:w-auto gap-3">
                 <button 
                    onClick={resetState}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-1/2 sm:w-auto"
                    disabled={isLoading}
                >
                    Reset
                </button>
                <button
                    onClick={handleGenerate}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-1/2 sm:w-auto"
                    disabled={isLoading || !originalImage || !prompt}
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
