import React from 'react';
import { useTrainContext } from '../../context/Context';

const ContentDivider = () => {
  const { suggestions } = useTrainContext();

  if (!suggestions) {
    return null;
  }

  return (
    <div className="hidden lg:flex w-px bg-gradient-to-b from-transparent via-surface-300 to-transparent min-h-[400px] self-stretch" />
  );
};

export default ContentDivider;
