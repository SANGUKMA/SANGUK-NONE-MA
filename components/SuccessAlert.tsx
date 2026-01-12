import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessAlertProps {
  onClose: () => void;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">저장 완료!</h3>
        <p className="text-gray-600 mb-6">
          심방 기록이 성공적으로 저장되었습니다.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          확인
        </button>
      </div>
    </div>
  );
};