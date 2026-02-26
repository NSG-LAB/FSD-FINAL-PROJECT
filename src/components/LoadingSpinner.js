import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 32, color = '#2563eb', className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <ClipLoader size={size} color={color} />
  </div>
);

export default LoadingSpinner;