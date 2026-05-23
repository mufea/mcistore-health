import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle, Heart, Leaf, Shield, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";

const features = [
  {
    icon: Heart,
    title: "Personalized Health",
    description: "Our intelligent survey maps your unique health profile to the right products.",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description: "Premium supplements and wellness products crafted from nature's finest sources.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Every product is rigorously tested and certified for safety and efficacy.",
  },
  {
    icon: Sparkles,
    title: "Premium Experience",
    description: "Curated wellness collections for those who demand the very best.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Wellness Enthusiast",
    text: "The health survey was incredibly insightful. The recommended products have transformed my daily routine.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Executive",
    text: "Finally, a health brand that understands my specific needs. The premium collection is exceptional.",
    rating: 5,
  },
  {
    name: "Priya K.",
    role: "Fitness Coach",
    text: "I recommend VitaWell to all my clients. The personalized approach makes all the difference.",
    rating: 5,
  },
];

export default function Home() {
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const { data: featuredProducts } = trpc.products.list.useQuery({ segment: "standard" });

  const featured = (featuredProducts ?? []).filter((p) => p.isFeatured).slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.12_75/0.08),transparent_60%)]" />
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
              Premium Health & Wellness
            </Badge>
            <h1 className="font-serif text-5xl lg:text-7xl font-light text-foreground leading-tight mb-6">
              Your Journey to{" "}
              <span className="font-semibold text-primary italic">Optimal Health</span>{" "}
              Starts Here
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
              {settings?.siteTagline ?? "Discover personalized health products tailored to your unique needs through our intelligent health assessment."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                <Link href="/survey">
                  Take Health Survey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 px-8">
                <Link href="/products">
                  Browse Products
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[
                { label: "Trusted Customers", value: "10,000+" },
                { label: "Premium Products", value: "200+" },
                { label: "Satisfaction Rate", value: "98%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Survey CTA Banner */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <div className="gold-line mx-auto mb-6" style={{ background: "linear-gradient(to right, oklch(0.88 0.06 75), oklch(0.72 0.12 75))" }} />
          <h2 className="font-serif text-3xl lg:text-4xl font-light mb-4">
            Discover Your Perfect Health Profile
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Answer a few simple questions about your health goals and lifestyle. Our intelligent system will recommend the perfect products for you.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 px-8">
            <Link href="/survey">
              Start Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mb-3">
              Why Choose VitaWell
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We combine science, nature, and personalization to deliver exceptional health outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl border border-border/60 bg-card card-hover"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="gold-line mb-4" />
                <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mb-2">
                  Featured Products
                </h2>
                <p className="text-muted-foreground">Our most loved wellness essentials</p>
              </div>
              <Button asChild variant="ghost" className="gap-2 hidden sm:flex">
                <Link href="/products">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className="group bg-card rounded-xl border border-border/60 overflow-hidden card-hover cursor-pointer">
                    <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          IDR {Number(product.price).toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-primary font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Three simple steps to your personalized wellness journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Take the Survey",
                description: "Answer questions about your health goals, lifestyle, and current concerns.",
              },
              {
                step: "02",
                title: "Get Recommendations",
                description: "Our system analyzes your answers and curates the perfect product selection.",
              },
              {
                step: "03",
                title: "Order & Transform",
                description: "Choose your products, complete checkout, and begin your health transformation.",
              },
            ].map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-xl font-semibold text-primary">{step.step}</span>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute translate-x-full -translate-y-8 w-full h-px bg-border/60" />
                )}
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
              <Link href="/survey">
                Begin Your Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mb-3">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-xl border border-border/60 p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[oklch(0.72_0.12_75)] text-[oklch(0.72_0.12_75)]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="font-serif text-3xl lg:text-4xl font-light text-foreground mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join thousands of customers who have discovered their perfect wellness routine with VitaWell.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-10">
            <Link href="/survey">
              Start Your Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
