
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext'; // For potential user context if saving

const DocumentScannerPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser } = useAuth(); // Get current user if needed for saving
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        stopCameraStream(); // Stop camera if it was active
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };
  
  const startCamera = async () => {
    stopCameraStream(); 
    setError(null);
    setImagePreview(null);
    
    const constraintsToTry: MediaStreamConstraints[] = [
        { video: { facingMode: "environment" } },
        { video: { facingMode: "user" } },
        { video: true }
    ];

    let mediaStream: MediaStream | null = null;
    for (const constraint of constraintsToTry) {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
            if (mediaStream) break; // Success
        } catch (err) {
            console.warn(`Failed to get camera with constraint: ${JSON.stringify(constraint)}`, err);
        }
    }

    if (mediaStream) {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } else {
      console.error("Error accessing camera after trying all constraints.");
      setError(translate('cameraError'));
      stopCameraStream();
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      stopCameraStream();
    }
  };

  const handleSaveScan = () => {
    if (!imagePreview) return;
    // Placeholder for saving logic. 
    // In a real app, you might upload this to Firebase Storage,
    // then perhaps save the URL to Firestore, possibly with OCR results.
    console.log("Save Scan initiated. Image data (base64):", imagePreview.substring(0,100) + "...");
    alert(translate('saveScan') + ' (Not implemented yet)');
  };
  
  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 sm:p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const buttonClasses = "py-2.5 px-5 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className={`${cardClasses} space-y-5`} dir={language}>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={startCamera} className={`${primaryButtonClasses} flex-1`}>{translate('takePhoto')}</button>
        <button onClick={() => fileInputRef.current?.click()} className={`${primaryButtonClasses} flex-1`}>{translate('selectFromGallery')}</button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      </div>

      {error && <p className="text-csp-error text-sm text-center p-2 bg-red-500/10 rounded-md">{error}</p>}

      {stream && (
        <div className="relative mt-4 border border-csp-secondary-text/30 rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[60vh] object-contain bg-black"></video>
          <button onClick={takePhoto} className={`${primaryButtonClasses} absolute bottom-4 left-1/2 -translate-x-1/2`}>
            {translate('takePhoto')}
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>


      {imagePreview && (
        <div className="mt-4 space-y-3">
          <h3 className="text-md font-semibold text-csp-primary-text dark:text-csp-primary-dark-text text-center">{translate('scannedDocumentPreview')}</h3>
          <img src={imagePreview} alt="Document preview" className="w-full max-w-md mx-auto h-auto rounded-md border border-csp-secondary-text/30 shadow-md" />
          <div className="flex gap-3">
            <button onClick={() => setImagePreview(null)} className={`${buttonClasses} flex-1 bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-opacity-80`}>{translate('cancel')}</button>
            <button onClick={handleSaveScan} className={`${primaryButtonClasses} flex-1`}>{translate('saveScan')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentScannerPage;
