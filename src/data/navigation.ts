import { NavigationConfig } from '@/types';

export const navigationConfig: NavigationConfig = {
  mainNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Appointments',
      href: '/appointments',
    },
    {
      title: 'Patients',
      href: '/patients',
    },
  ],
  footerNav: [
    {
      title: 'Company',
      children: [
        {
          title: 'About Us',
          href: '/about',
        },
        {
          title: 'Our Team',
          href: '/about#team',
        },
        {
          title: 'Careers',
          href: '/careers',
        },
        {
          title: 'Press',
          href: '/press',
        },
      ],
    },
    {
      title: 'Services',
      children: [
        {
          title: 'Web Development',
          href: '/services#web-development',
        },
        {
          title: 'Mobile Apps',
          href: '/services#mobile-apps',
        },
        {
          title: 'UI/UX Design',
          href: '/services#design',
        },
        {
          title: 'Consulting',
          href: '/services#consulting',
        },
      ],
    },
    {
      title: 'Resources',
      children: [
        {
          title: 'Blog',
          href: '/blog',
        },
        {
          title: 'Case Studies',
          href: '/case-studies',
        },
        {
          title: 'Documentation',
          href: '/docs',
        },
        {
          title: 'Support',
          href: '/support',
        },
      ],
    },
    {
      title: 'Legal',
      children: [
        {
          title: 'Privacy Policy',
          href: '/privacy',
        },
        {
          title: 'Terms of Service',
          href: '/terms',
        },
        {
          title: 'Cookie Policy',
          href: '/cookies',
        },
        {
          title: 'GDPR',
          href: '/gdpr',
        },
      ],
    },
  ],
};
