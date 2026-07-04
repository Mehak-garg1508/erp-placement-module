import React from "react";

export const CardSkeleton = () => {
  return (
    <div className="animate-pulse p-6 space-y-4 bg-white dark:bg-gray-900 rounded-2xl">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};
