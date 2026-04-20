import React from 'react';
import { Navbar } from '../layout';
import { Spinner } from './Loading';

/**
 * Full-page loading state with Navbar.
 */
export const PageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-surface-50">
    <Navbar />
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-surface-500">{message}</p>
    </div>
  </div>
);

/**
 * Full-page error state with Navbar.
 */
export const PageError = ({ message = 'Something went wrong' }) => (
  <div className="min-h-screen bg-surface-50">
    <Navbar />
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl max-w-md">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  </div>
);
