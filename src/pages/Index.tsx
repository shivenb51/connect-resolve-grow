import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, TrendingUp, MessageSquare, Sparkles, Lock } from "lucide-react";
import heroImage from "@/assets/hero-couple.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "Both Perspectives Matter",
      description: "Share your unique viewpoints and let AI provide balanced, empathetic analysis",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Get unbiased analysis and practical solutions for better communication",
    },
    {
      icon: TrendingUp,
      title: "Track Growth Together",
      description: "Weekly and monthly reports show your relationship patterns and progress",
    },
    {
      icon: Lock,
      title: "Private & Encrypted",
      description: "Your conversations are secure. We can't read your data - it's yours alone",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Relationship Insights</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Understand Each Other
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Better Together
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Share both perspectives, get AI analysis, and build a stronger relationship through
                understanding and data-driven insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-8"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="text-lg px-8 border-2"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Built for Couples</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
              <img
                src={heroImage}
                alt="Relationship Connection"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How RelationSync Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A smarter way to understand each other and grow together
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="shadow-soft hover:shadow-medium transition-all border-2 hover:border-primary/20"
            >
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary to-accent text-white shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">Ready to Strengthen Your Bond?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join couples who are building better understanding through AI-powered insights
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">RelationSync</span>
          </div>
          <p className="text-sm">Building better relationships through understanding</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;