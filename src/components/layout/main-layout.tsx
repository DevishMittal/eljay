'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { BaseComponentProps } from '@/types';
import Header from './header';
import Footer from './footer';

interface MainLayoutProps extends BaseComponentProps {
  transparentHeader?: boolean;
  showFooter?: boolean;
  showNewsletter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  transparentHeader = false,
  showFooter = true,
  showNewsletter = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={transparentHeader} />
      
      <motion.main
        className={cn('flex-1', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.main>
      
      {showFooter && <Footer showNewsletter={showNewsletter} />}
    </div>
  );
};

export default MainLayout;
