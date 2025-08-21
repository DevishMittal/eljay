import type { Metadata } from 'next';
import MainLayout from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Eljay - Building modern, high-performance websites that deliver exceptional user experiences.',
  keywords: ['web development', 'modern websites', 'performance', 'user experience'],
};

export default function HomePage() {
  return (
    <MainLayout transparentHeader={true}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Building Modern
              <span className="text-primary block">Web Experiences</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We create high-performance, responsive websites that help businesses grow and deliver exceptional user experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Get Started
              </button>
              <button className="px-8 py-3 border border-border bg-background text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                View Our Work
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Eljay?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with proven design principles to create websites that perform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Modern Technology',
                description: 'Built with the latest frameworks and tools for optimal performance and maintainability.',
                icon: '⚡',
              },
              {
                title: 'Responsive Design',
                description: 'Perfect on all devices - from mobile phones to large desktop screens.',
                icon: '📱',
              },
              {
                title: 'Performance Focused',
                description: 'Optimized for speed with best practices for Core Web Vitals and user experience.',
                icon: '🚀',
              },
              {
                title: 'SEO Optimized',
                description: 'Built with search engine optimization in mind to help you rank better.',
                icon: '🔍',
              },
              {
                title: 'Accessibility First',
                description: 'Inclusive design that works for everyone, regardless of abilities.',
                icon: '♿',
              },
              {
                title: 'Ongoing Support',
                description: 'We\'re here to help you grow and maintain your website long-term.',
                icon: '🤝',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-background rounded-lg border border-border hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss your project and create something amazing together.
          </p>
          <button className="px-8 py-3 bg-primary-foreground text-primary rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors">
            Contact Us Today
          </button>
        </div>
      </section>
    </MainLayout>
  );
}
