import React from 'react';

const SkeletonLoader = ({ type = 'card', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  switch (type) {
    case 'card':
      return (
        <div className={`ui-card-item mobile-card ${baseClasses} ${className}`}>
          <div className="h-6 bg-gray-300 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`${baseClasses} h-4 ${className}`}></div>
      );

    case 'title':
      return (
        <div className={`${baseClasses} h-8 w-3/4 ${className}`}></div>
      );

    case 'button':
      return (
        <div className={`${baseClasses} h-10 w-24 ${className}`}></div>
      );

    case 'avatar':
      return (
        <div className={`${baseClasses} h-12 w-12 rounded-full ${className}`}></div>
      );

    case 'chart':
      return (
        <div className={`${baseClasses} h-64 w-full ${className}`}></div>
      );

    case 'table':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className={`${baseClasses} h-8 w-full`}></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`${baseClasses} h-6 w-full`}></div>
          ))}
        </div>
      );

    case 'dashboard-stats':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`ui-card-item mobile-card ${baseClasses}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${baseClasses} h-4 w-16`}></div>
                <div className={`${baseClasses} h-8 w-8 rounded`}></div>
              </div>
              <div className={`${baseClasses} h-8 w-20 mb-2`}></div>
              <div className={`${baseClasses} h-3 w-24`}></div>
            </div>
          ))}
        </div>
      );

    case 'property-list':
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`ui-card-item mobile-card ${baseClasses}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className={`${baseClasses} h-6 w-3/4 mb-2`}></div>
                  <div className={`${baseClasses} h-4 w-1/2 mb-1`}></div>
                  <div className={`${baseClasses} h-4 w-2/3`}></div>
                </div>
                <div className={`${baseClasses} h-16 w-16 rounded`}></div>
              </div>
              <div className="flex space-x-4">
                <div className={`${baseClasses} h-8 w-20`}></div>
                <div className={`${baseClasses} h-8 w-16`}></div>
                <div className={`${baseClasses} h-8 w-18`}></div>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return <div className={`${baseClasses} h-4 w-full ${className}`}></div>;
  }
};

export default SkeletonLoader;