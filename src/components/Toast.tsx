import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastType } from '../hooks/useToast';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      borderColor: 'border-red-600',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      borderColor: 'border-blue-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      borderColor: 'border-yellow-600',
    },
  };

  const { icon: Icon, bgColor, textColor, borderColor } = config[type];

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right`}>
      <div className={`${bgColor} ${textColor} ${borderColor} border-l-4 rounded-lg shadow-2xl max-w-md p-4 flex items-start gap-3`}>
        <Icon size={24} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default Toast;
