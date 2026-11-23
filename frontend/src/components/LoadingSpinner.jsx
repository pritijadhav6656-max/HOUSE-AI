import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      {label && <p className="text-sm font-medium text-[#64748B]">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
        {content}
      </div>
    );
  }
  return content;
};

export default LoadingSpinner;
