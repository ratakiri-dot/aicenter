"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calculator, ExternalLink, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimulatorPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary flex items-center gap-3">
                        <Calculator className="w-10 h-10" />
                        Simulator Biaya
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Estimasi biaya pendaftaran dan audit sertifikasi halal sesuai regulasi BPJPH terbaru.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold" asChild>
                        <a href="https://bpjph.halal.go.id/kalkulator-biaya-sh/" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Sumber Resmi
                        </a>
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-card/50 backdrop-blur-md relative h-[850px] group transition-all duration-500 hover:shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary z-20" />

                {/* Overlay for loading placeholder or info */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-black/90 px-3 py-1.5 rounded-full border border-border shadow-sm text-[10px] font-bold text-primary uppercase tracking-widest backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShieldCheck className="w-3 h-3 text-secondary" />
                    Verified BPJPH Source
                </div>

                <CardContent className="p-0 h-full w-full relative">
                    <iframe
                        src="https://bpjph.halal.go.id/kalkulator-biaya-sh/"
                        className="w-full h-full border-none"
                        title="BPJPH Cost Calculator"
                        loading="lazy"
                        allow="payment"
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                <Card className="p-6 bg-amber-500/5 border-amber-500/10 shadow-sm border-l-4 border-l-amber-500">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-500" />
                        Kep Kaban 22/2024
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Kalkulator ini menggunakan Keputusan Kepala BPJPH No. 22 Tahun 2024. Biaya mencakup pendaftaran, pemeriksaan LPH, dan penetapan fatwa.
                    </p>
                </Card>
                <Card className="p-6 bg-primary/5 border-primary/10 shadow-sm border-l-4 border-l-primary">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Pilih LPH UNISMA
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Dapatkan kemudahan proses verifikasi dengan memilih **LPH Universitas Islam Malang** sebagai mitra pemeriksaan halal Anda di aplikasi SIHALAL.
                    </p>
                </Card>
                <Card className="p-6 bg-secondary/5 border-secondary/10 shadow-sm border-l-4 border-l-secondary md:col-span-2 lg:col-span-1">
                    <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-secondary" />
                        Bantuan Teknis
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Kesulitan menghitung? Hubungi UNI AI atau gunakan layanan Voice AI kami untuk panduan langkah demi langkah pengisian data simulator.
                    </p>
                </Card>
            </div>
        </div>
    );
}

