"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";
import { ArrowRight, FileText, Car, Users, BarChart } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/home");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/robodog-logo.png"
              alt="robodog Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold">robodog</span>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/login")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Insurance Management Made Simple
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              robodog helps insurance companies streamline their operations,
              manage policies, and track vehicles with ease.
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" onClick={() => router.push("/login")}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Policy Management</h3>
              <p className="text-muted-foreground">
                Create, track, and manage insurance policies with our intuitive
                interface.
              </p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vehicle Tracking</h3>
              <p className="text-muted-foreground">
                Keep detailed records of all insured vehicles and their status.
              </p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Customer Management
              </h3>
              <p className="text-muted-foreground">
                Maintain comprehensive customer profiles and communication
                history.
              </p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Analytics & Reporting
              </h3>
              <p className="text-muted-foreground">
                Generate insights with powerful analytics and customizable
                reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Insurance Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of insurance companies that trust robodog to
            streamline their operations.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/login")}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="/robodog-logo.png"
                alt="robodog Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="text-xl font-bold">robodog</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} robodog. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
