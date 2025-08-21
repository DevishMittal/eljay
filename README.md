# Eljay - Modern Multi-Page Website

A modern, high-performance multi-page website built with Next.js 15, Tailwind CSS v4, and TypeScript.

## 🚀 Features

- **Next.js 15** with App Router for optimal performance
- **Tailwind CSS v4** for modern, responsive styling
- **TypeScript** for type safety and better development experience
- **Framer Motion** for smooth animations and transitions
- **React Hook Form** for form handling
- **Responsive Design** - Mobile-first approach
- **Performance Optimized** - Built with best practices
- **SEO Ready** - Proper metadata and structured data
- **Accessibility Compliant** - WCAG guidelines followed

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles with Tailwind v4
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components (Button, Card, Input)
│   ├── layout/           # Layout components (Header, Footer, MainLayout)
│   ├── sections/         # Page-specific sections
│   ├── animations/       # Animation components
│   ├── forms/            # Form components
│   └── common/           # Shared components
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
└── data/                 # Static data and content
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Custom SVG icons
- **Fonts**: Geist Sans & Geist Mono

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eljay
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Design System

The project uses a comprehensive design system with:

- **Color Palette**: Primary, secondary, accent, and semantic colors
- **Typography**: Consistent font hierarchy and spacing
- **Spacing**: Systematic spacing scale
- **Components**: Reusable UI components with variants
- **Animations**: Consistent motion design

## 📱 Responsive Design

The website is built with a mobile-first approach and includes:

- Mobile (0px - 639px)
- Tablet (640px - 1023px)
- Desktop (1024px - 1279px)
- Large Desktop (1280px+)
- Ultra-wide (1536px+)

## 🔧 Configuration

### Tailwind CSS v4

Tailwind CSS v4 is pre-configured with Next.js and includes:

- Custom design tokens
- Dark mode support
- Responsive utilities
- Performance optimizations

### TypeScript

Strict TypeScript configuration with:

- Path aliases (`@/*`)
- Strict type checking
- Custom type definitions
- Component prop interfaces

## 📄 Pages Structure

The website includes the following pages:

- **Home** (`/`) - Landing page with hero section and features
- **About** (`/about`) - Company information and team
- **Services** (`/services`) - Service offerings
- **Portfolio** (`/portfolio`) - Work showcase
- **Contact** (`/contact`) - Contact form and information

## 🎯 Performance Features

- **Code Splitting**: Automatic page-level code splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts with display swap
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Optimized caching strategies

## 🔒 Security

- **Content Security Policy**: Configured headers
- **Input Validation**: Form validation with Zod
- **XSS Protection**: Built-in Next.js protections
- **HTTPS**: Production-ready SSL configuration

## 📈 SEO & Analytics

- **Meta Tags**: Dynamic metadata for each page
- **Structured Data**: Schema.org markup
- **Sitemap**: Automatic sitemap generation
- **Open Graph**: Social media optimization
- **Analytics**: Ready for Google Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ by the Eljay team
