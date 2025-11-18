import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface VisualNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const VisualNotification = ({ message, type, duration = 5000, onClose }: VisualNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6" />;
      case 'error': return <AlertTriangle className="w-6 h-6" />;
      case 'warning': return <AlertTriangle className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div 
      className={`fixed top-20 left-4 right-4 z-[60] p-4 rounded-lg border-2 shadow-lg animate-pulse ${getStyles()}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="font-semibold flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="p-1 hover:bg-black/10 rounded"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VisualNotification;