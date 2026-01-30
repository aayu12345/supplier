import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import DemoSection from "@/components/DemoSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 select-none">
      <Navbar />
      <Hero />
      <Features />
      {/* Divider */}
      <div className="bg-gray-50 h-px w-full max-w-7xl mx-auto" />
      <HowItWorks />
      <DemoSection />
      <Footer />
    </main>
  );
}
