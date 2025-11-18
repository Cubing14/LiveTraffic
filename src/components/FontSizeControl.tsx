import { Minus, Plus, RotateCcw, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFontSize } from '@/hooks/useFontSize';

const FontSizeControl = () => {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  const getFontSizeLabel = () => {
    switch (fontSize) {
      case 'small': return 'Pequeña';
      case 'normal': return 'Normal';
      case 'large': return 'Grande';
      case 'extra-large': return 'Extra Grande';
      default: return 'Normal';
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <Type className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-medium">Tamaño:</span>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={decreaseFontSize}
          disabled={fontSize === 'small'}
          aria-label="Disminuir tamaño de fuente"
          className="h-8 w-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <span className="text-xs px-2 py-1 bg-background rounded border min-w-[80px] text-center">
          {getFontSizeLabel()}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={increaseFontSize}
          disabled={fontSize === 'extra-large'}
          aria-label="Aumentar tamaño de fuente"
          className="h-8 w-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFontSize}
          aria-label="Restablecer tamaño de fuente"
          className="h-8 w-8 p-0 ml-1"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default FontSizeControl;