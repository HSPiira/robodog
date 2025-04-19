"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Shield,
  Car,
  Users,
  BarChart,
  ArrowRight,
  LogIn,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/robodog-logo.png"
              alt="robodog"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              robodog
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in
            </Button>
            <Button size="sm" onClick={() => router.push("/register")}>
              Get started
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Transform Your Business with robodog
            </h1>
            <p className="text-xl text-muted-foreground">
              Streamline your operations, enhance customer experience, and drive
              growth with our comprehensive management platform.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => router.push("/register")}>
                Get started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your business
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-6 rounded-xl shadow-lg border border-muted hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Policy Management</h3>
              <p className="text-muted-foreground">
                Efficiently manage policies with automated workflows and
                real-time updates.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg border border-muted hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Tracking</h3>
              <p className="text-muted-foreground">
                Track and manage vehicle information with our intuitive
                interface.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg border border-muted hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Customer Management
              </h3>
              <p className="text-muted-foreground">
                Maintain detailed customer profiles and interaction history.
              </p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg border border-muted hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Analytics & Reporting
              </h3>
              <p className="text-muted-foreground">
                Make data-driven decisions with comprehensive analytics tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Ready to transform your business?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals who trust robodog to power their
              business.
            </p>
            <Button size="lg" onClick={() => router.push("/register")}>
              Get started today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <span className="text-sm">© 2024 robodog. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
