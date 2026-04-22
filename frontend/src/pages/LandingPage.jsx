import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  TicketCheck, Zap, Shield, Clock, BarChart3, Users,
  CheckCircle, Star, ArrowRight, MessageSquare,
  Sparkles, Award, Target, ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // If already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "admin" ? "/admin/dashboard" : "/dashboard");
    }
  }, [user, userRole, navigate]);

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Categorization",
      description: "Automatically categorize tickets using advanced AI technology for faster resolution.",
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Get instant notifications and live updates on your ticket status via WebSocket.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Visualize ticket trends with heatmaps and comprehensive analytics dashboards.",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with Firebase authentication and encrypted data.",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: MessageSquare,
      title: "Rich Text Editor",
      description: "Format your messages with bold, italic, lists, and code blocks for clarity.",
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
      icon: Users,
      title: "Bulk Actions",
      description: "Manage multiple tickets at once with powerful bulk action capabilities.",
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-900/20"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "< 2hrs", label: "Avg Response" },
    { value: "10K+", label: "Tickets Resolved" },
    { value: "4.9/5", label: "Satisfaction" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      avatar: "S",
      rating: 5,
      text: "The AI categorization is amazing! My tickets get routed to the right department instantly. Support team is super responsive."
    },
    {
      name: "Michael Chen",
      role: "Engineering Student",
      avatar: "M",
      rating: 5,
      text: "Love the real-time updates and dark mode. The interface is clean and intuitive. Best ticketing system I've used!"
    },
    {
      name: "Emily Rodriguez",
      role: "IT Administrator",
      avatar: "E",
      rating: 5,
      text: "Bulk actions save us hours every week. The analytics help us optimize our support schedule. Highly recommend!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <TicketCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Samadhan</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">University Support</p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition">Testimonials</a>
              <a href="#stats" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition">Stats</a>
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition shadow-lg shadow-teal-500/30"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-full mb-6">
              <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">AI-Powered Support System</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight pb-2">
              Best Open Source
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 py-2">
                University Ticketing
              </span>
              System
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Free self-hosted support platform with AI categorization, real-time updates, and advanced analytics. Built for students and administrators.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate("/signup")}
                className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition shadow-xl shadow-teal-500/30 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition"
              >
                Sign In
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>24/7 Support Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Easy to Use</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-6 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-full mb-4">
              <Target size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with modern technologies and best practices for the ultimate support experience.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-full mb-4">
              <Award size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Students & Staff
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what our users have to say about their experience with Samadhan.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden p-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Content */}
            <div className="relative text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
                Join thousands of students and administrators using Samadhan for seamless support management.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="group px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-50 transition shadow-xl flex items-center gap-2"
                >
                  Create Free Account
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <TicketCheck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Samadhan</h3>
                  <p className="text-xs text-gray-500">University Support System</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Open-source ticketing system built with modern technologies. Free, secure, and powerful support platform for educational institutions.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-teal-400 transition">Features</a></li>
                <li><a href="#testimonials" className="hover:text-teal-400 transition">Testimonials</a></li>
                <li><a href="#stats" className="hover:text-teal-400 transition">Statistics</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate("/login")} className="hover:text-teal-400 transition">Login</button></li>
                <li><button onClick={() => navigate("/signup")} className="hover:text-teal-400 transition">Sign Up</button></li>
                <li><button onClick={() => window.open('https://github.com', '_blank')} className="hover:text-teal-400 transition">Documentation</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2026 Samadhan. All rights reserved. Built with ❤️ for education.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => window.alert('Privacy Policy')} className="hover:text-teal-400 transition">Privacy Policy</button>
              <button onClick={() => window.alert('Terms of Service')} className="hover:text-teal-400 transition">Terms of Service</button>
              <button onClick={() => window.alert('Contact Us')} className="hover:text-teal-400 transition">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
