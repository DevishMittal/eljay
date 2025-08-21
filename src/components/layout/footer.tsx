'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { FooterProps } from '@/types';
import { navigationConfig } from '@/data/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer: React.FC<FooterProps> = ({ className, showNewsletter = true }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-muted/50 border-t border-border', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-foreground">Eljay</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Building modern, high-performance websites that deliver exceptional user experiences. 
              We help businesses grow with cutting-edge web solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { name: 'Twitter', href: '#', icon: '𝕏' },
                { name: 'LinkedIn', href: '#', icon: 'in' },
                { name: 'GitHub', href: '#', icon: '⌥' },
                { name: 'Dribbble', href: '#', icon: 'D' },
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  <span className="text-sm font-medium">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {navigationConfig.footerNav.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.children?.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href || '#'}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        {showNewsletter && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="max-w-md">
              <h3 className="font-semibold text-foreground mb-2">
                Stay updated with our newsletter
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest updates, articles, and insights delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="default">
                  Subscribe
                </Button>
              </form>
              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 mt-2"
                >
                  Thanks for subscribing!
                </motion.p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Eljay. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
