import React, { useState, useRef, useCallback } from 'react';
import Button from './shared/Button';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage, TranslationKey } from '../src/contexts/LanguageContext';

interface ImageUploaderProps {
  onImageAnalyzed: (ingredients: string[]) => void;
  onAnalysisError: (error: string) => void;
  analyzeImage: (base64ImageData: string) => Promise<string[]>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageAnalyzed, analyzeImage, onAnalysisError }) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error messages can be keys or direct strings
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit to 4MB
        setError(t('imageSizeError'));
        setSelectedImage(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShowCamera(false); 
    }
  };
  
  const startCamera = useCallback(async () => {
    setError(null);
    setShowCamera(true);
    setSelectedImage(null); 
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError(t('cameraAccessError'));
        setShowCamera(false);
      }
    } else {
      setError(t('cameraNotSupportedError'));
      setShowCamera(false);
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  const handleCapture = () => {
    setError(null);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(imageDataUrl);
      stopCamera();
    }
  };
  
  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError(t('selectOrCaptureError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const ingredients = await analyzeImage(base64Data);
      onImageAnalyzed(ingredients);
    } catch (err: any) {
      console.error("Analysis error:", err);
      // Use a generic translated error or pass the specific error message if it's user-friendly
      const apiErrorMessage = t('analysisApiError' as TranslationKey);
      setError(err.message?.includes("API key") ? apiErrorMessage : (err.message || apiErrorMessage));
      onAnalysisError(err.message?.includes("API key") ? apiErrorMessage : (err.message || apiErrorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0A2.25 2.25 0 0 1 3.75 7.5h16.5a2.25 2.25 0 0 1 2.25 2.25m-18.75 0h18.75c.621 0 1.125-.504 1.125-1.125V8.25c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.651c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
          {t('uploadFridgePhoto')}
        </Button>
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        <span className="text-gray-500">{t('or')}</span>
        <Button onClick={showCamera ? stopCamera : startCamera} variant="secondary" className="w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.174C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
          {showCamera ? t('closeCamera') : t('useCamera')}
        </Button>
      </div>

      {showCamera && (
        <div className="mt-4 p-2 border border-gray-300 rounded-lg bg-gray-100">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-md mx-auto rounded-md shadow aspect-video"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button onClick={handleCapture} className="mt-3 w-full" disabled={!videoRef.current?.srcObject}>
             {t('capturePhoto')}
          </Button>
        </div>
      )}
      
      {selectedImage && !showCamera && (
        <div className="mt-6 border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-gray-50">
          <img src={selectedImage} alt="Selected preview" className="max-h-80 max-w-full mx-auto rounded-md shadow-md" />
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {isLoading && <LoadingSpinner message={t('analyzingImage')} />}

      <Button 
        onClick={handleAnalyze} 
        disabled={!selectedImage || isLoading} 
        className="w-full sm:w-auto"
        size="lg"
      >
        {t('analyzeContents')}
      </Button>
    </div>
  );
};

export default ImageUploader;