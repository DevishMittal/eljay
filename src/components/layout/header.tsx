'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { HeaderProps, NavItem } from '@/types';
import { navigationConfig } from '@/data/navigation';
import { Button } from '@/components/ui/button';

const Header: React.FC<HeaderProps> = ({ 
  className, 
  transparent = false, 
  sticky = true 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const headerClasses = cn(
    'w-full transition-all duration-300 z-50',
    sticky && 'sticky top-0',
    transparent && !isScrolled && 'bg-transparent',
    !transparent || isScrolled ? 'bg-background/95 backdrop-blur-sm border-b border-border' : '',
    className
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-foreground">Eljay</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href || '#'}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary relative',
                  isActive(item.href || '')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.title}
                {isActive(item.href || '') && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={cn(
                  'block w-5 h-0.5 bg-current transition-all duration-300',
                  isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-current transition-all duration-300',
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                )}
              />
              <span
                className={cn(
                  'block w-5 h-0.5 bg-current transition-all duration-300',
                  isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm"
            >
              <nav className="py-4 space-y-2">
                {navigationConfig.mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href || '#'}
                    className={cn(
                      'block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md',
                      isActive(item.href || '')
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="px-4 pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                  <Button className="w-full justify-start">
                    Get Started
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
