import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useAntiOverload } from '@/hooks/useAntiOverload';

interface AntiOverloadBannerProps {
  habits: any[];
  completions: any[];
}

export const AntiOverloadBanner = ({ habits, completions }: AntiOverloadBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { overloadDetected, overloadLevel, suggestions } = useAntiOverload(habits, completions);

  if (!overloadDetected || dismissed) return null;

  const getAlertColor = () => {
    switch (overloadLevel) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-orange-500/50 bg-orange-500/10';
      default:
        return 'border-yellow-500/50 bg-yellow-500/10';
    }
  };

  const getIcon = () => {
    switch (overloadLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <Alert className={`relative ${getAlertColor()} animate-fade-in`}>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="w-4 h-4" />
      </Button>
      
      {getIcon()}
      <AlertTitle>
        {overloadLevel === 'high' ? '⚠️ Surcharge Détectée' : 'Attention au Rythme'}
      </AlertTitle>
      <AlertDescription className="space-y-2 mt-2">
        <ul className="list-disc list-inside space-y-1">
          {suggestions.map((suggestion, idx) => (
            <li key={idx} className="text-sm">{suggestion}</li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>
            J'ai compris
          </Button>
          {overloadLevel === 'high' && (
            <Button size="sm" variant="default">
              Voir mes habitudes
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
