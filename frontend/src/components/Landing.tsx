import React, {useState, useEffect} from "react";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {Card, CardContent} from "./ui/card";
import {Badge} from "./ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {
  ArrowRight,
  Code,
  Zap,
  Users,
  Star,
  GitBranch,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Mail
} from "lucide-react";
import {storeEmailLocally} from "../api/emailService";
import Bleak from "./bleak";

export default function Landing() {
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 800);

    return () => {
      clearTimeout(contentTimer);
    };
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      // For now, using localStorage. Replace with actual email service integration
      const success = storeEmailLocally(email);

      if (success) {
        setIsSubmitted(true);
        setEmail("");

        // Reset after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit email:", error);
    }
  };

  const companies = [
    {name: "Pack den Sack", initial: "P"},
    {name: "Bjj Gym", initial: "B"},
    {name: "Kronologs", initial: "K"}
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}

      <div className="flex items-center justify-center min-h-screen px-4 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/5 to-rose-800/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-800/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Main Content */}
          <Bleak />

          <div
            className={`transition-all duration-1000 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            id="main"
          >
            {/* Tagline */}
            <div className="mb-8">
              <Badge
                variant="outline"
                className="mb-6 border-white/20 text-white/80"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI responses as UI components
              </Badge>

              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                The{" "}
                <span className="bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
                  Chatbot API
                </span>
                <br />
                Built for Developers
              </h2>

              <p className="text-xl sm:text-2xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                Skip the plain text. Get AI responses as ready-to-use UI
                components that plug directly into your frontend apps.
              </p>
            </div>

            {/* Email Capture */}
            <div className="mb-12">
              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-rose-600"
                  required
                />
                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-white/90 font-medium px-8"
                  disabled={isSubmitted}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Get Early Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              <p className="text-sm text-white/50 mt-3">
                Join {Math.floor(Math.random() * 500) + 1200}+ developers
                building with Bleak
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-rose-700 hover:bg-rose-800 text-white font-medium px-8"
                onClick={() =>
                  document
                    .getElementById("demo")
                    ?.scrollIntoView({behavior: "smooth"})
                }
              >
                <Code className="w-5 h-5 mr-2" />
                View Demo
              </Button>
              <Button
                size="lg"
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-8"
                onClick={() => (window.location.hash = "chat")}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Chat
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 font-medium px-8"
                onClick={() =>
                  window.open("https://github.com/your-repo/bleak", "_blank")
                }
              >
                <GitBranch className="w-5 h-5 mr-2" />
                Star on GitHub
              </Button>
            </div>

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-sm text-white/50 mb-6">
                Trusted by developers at
              </p>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                {companies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-white/10 text-xs font-medium">
                        {company.initial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        className={`py-24 px-4 transition-all duration-1000 delay-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-rose-600">Bleak</span>?
            </h3>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Traditional chatbots return plain text. Bleak returns interactive
              UI components ready for production.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">
                  Instant Integration
                </h4>
                <p className="text-white/70">
                  Get UI components instead of text. Copy, paste, and ship—no
                  conversion needed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">
                  Smart Responses
                </h4>
                <p className="text-white/70">
                  Context-aware AI that understands your app structure and
                  returns appropriate components.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-700/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">
                  Developer First
                </h4>
                <p className="text-white/70">
                  Built by developers, for developers. Simple API, great docs,
                  and active community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div
        id="demo"
        className={`py-24 px-4 bg-white/5 transition-all duration-1000 delay-700 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-8">
            See Bleak in <span className="text-rose-600">Action</span>
          </h3>

          <Button
            size="lg"
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-8"
            onClick={() => (window.location.hash = "chat")}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Try Chat
          </Button>
        </div>
      </div>

      {/* Final CTA */}
      <div
        className={`py-24 px-4 transition-all duration-1000 delay-1000 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build Faster?
          </h3>
          <p className="text-xl text-white/70 mb-8">
            Join hundreds of developers already building with Bleak.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-medium px-8"
            >
              <Mail className="w-5 h-5 mr-2" />
              Get Early Access
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 font-medium px-8"
            >
              <Star className="w-5 h-5 mr-2" />
              Star on GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
