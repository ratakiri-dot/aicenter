"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, Zap, MessageSquare, Phone, Search, Calculator } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Chatbot UNI",
    desc: "Asisten cerdas untuk konsultasi regulasi dan prosedur halal.",
    icon: MessageSquare,
    href: "/chatbot",
    color: "bg-blue-500",
    shadow: "shadow-blue-500/20"
  },
  {
    title: "Voice AI",
    desc: "Konsultasi interaktif via suara tanpa perlu mengetik.",
    icon: Phone,
    href: "/voice",
    color: "bg-purple-500",
    shadow: "shadow-purple-500/20"
  },
  {
    title: "Halal Explorer",
    desc: "Cari ID Halal produk dan cek kehalalan bahan pangan.",
    icon: Search,
    href: "/search",
    color: "bg-green-600",
    shadow: "shadow-green-600/20"
  },
  {
    title: "Simulator Biaya",
    desc: "Hitung estimasi biaya sertifikasi secara akurat.",
    icon: Calculator,
    href: "/simulator",
    color: "bg-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    title: "UMKM Business Kit",
    desc: "Bonus Eksklusif! Buat materi promosi & foto produk profesional otomatis. Solusi digital agar produk Anda makin laris setelah bersertifikat.",
    icon: Sparkles,
    href: "/business",
    color: "bg-rose-500",
    shadow: "shadow-rose-500/20",
    featured: true // New property to trigger special styling
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-secondary" />
          Selamat Datang di AI Center LPH UNISMA
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-primary leading-tight">
          Digitalize Halal <br />
          <span className="text-secondary bg-clip-text">Certification Information with AI</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-medium">
          Platform AI Center LPH UNISMA untuk mempermudah pelaku usaha dalam memperoleh informasi sertifikasi halal dengan bantuan teknologi AI terkini.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
            <Link href="/chatbot">
              Mulai Konsultasi
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-bold border-2 hover:bg-muted" asChild>
            <Link href="/simulator">Cek Biaya</Link>
          </Button>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Link
            key={i}
            href={f.href}
            className={cn(
              "group",
              f.featured && "md:col-span-2 lg:col-span-4 lg:w-3/4 lg:mx-auto" // Center the featured item on large screens
            )}
          >
            <Card className={cn(
              "h-full border-none shadow-xl transition-all duration-500 hover:-translate-y-2 group-hover:shadow-2xl relative overflow-hidden",
              f.shadow,
              f.featured && "bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border-2 border-rose-500/20"
            )}>
              {f.featured && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse shadow-lg shadow-rose-500/40">
                  Layanan Unggulan
                </div>
              )}
              <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20", f.color)} />
              <CardContent className={cn("p-8 space-y-4", f.featured && "flex flex-col items-center text-center")}>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", f.color, f.featured && "w-20 h-20 rounded-3xl mb-2")}>
                  <f.icon className={cn("w-8 h-8", f.featured && "w-10 h-10")} />
                </div>
                <div>
                  <h3 className={cn("text-2xl font-black", f.featured && "text-3xl text-rose-600 dark:text-rose-400")}>{f.title}</h3>
                  {f.featured && <span className="text-secondary font-bold text-sm uppercase tracking-widest">Bonus Spesial Mitra LPH UNISMA</span>}
                </div>
                <p className={cn("text-muted-foreground font-medium leading-relaxed", f.featured && "text-lg max-w-lg")}>
                  {f.desc}
                </p>
                <div className="pt-4 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                  Coba Sekarang <ArrowRight className="ml-1 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Stats / Trust Section */}
      <section className="bg-primary rounded-[3rem] p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white blur-[150px] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10 text-center lg:text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold">Terpercaya & Akurat</h2>
            <p className="opacity-80 font-medium">Data yang kami sajikan tersinkronisasi dengan regulasi BPJPH terbaru.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold">Respon Real-time</h2>
            <p className="opacity-80 font-medium">Asisten cerdas kami tersedia 24/7 untuk menjawab kebingungan Anda.</p>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="px-8 py-6 rounded-3xl bg-secondary text-primary-foreground font-black text-center shadow-2xl">
              <div className="text-4xl">100%</div>
              <div className="text-sm uppercase tracking-widest opacity-80">Digital Solution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2">
          <span className="text-primary font-black uppercase">LPH UNISMA</span> © 2026
        </p>
      </footer>
    </div>
  );
}

// Helper function needed because it wasn't imported in this specific file call
import { cn } from "@/lib/utils";
