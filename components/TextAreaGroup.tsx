import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface TextAreaGroupProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

export const TextAreaGroup: React.FC<TextAreaGroupProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  icon,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support for Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome, Safari, Edge 등을 사용해주세요.");
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.lang = 'ko-KR'; // Korean
      recognition.continuous = true; // Keep listening until stopped manually or silence
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        // Append to existing text with a space if needed
        const newText = value + (value && !value.endsWith(' ') ? ' ' : '') + transcript;
        
        // Trigger generic change event
        const syntheticEvent = {
          target: {
            name: id,
            value: newText,
          },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        onChange(syntheticEvent);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          {icon && <span className="text-gray-500">{icon}</span>}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
              ${isListening 
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 animate-pulse' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
            `}
            title="음성으로 입력하기"
          >
            {isListening ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>듣는 중...</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"/>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3" />
                <span>음성 입력</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="relative">
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`
            block w-full rounded-lg border p-3 text-gray-900 shadow-sm transition-colors resize-y min-h-[120px] bg-white
            ${isListening 
              ? 'border-red-400 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-300'}
          `}
        />
        {isListening && (
          <div className="absolute bottom-3 right-3">
             <button 
               type="button"
               onClick={stopListening}
               className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
             >
               <MicOff className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};