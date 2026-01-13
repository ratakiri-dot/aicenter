"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, CheckCircle2, XCircle, AlertTriangle, Fingerprint, BrainCircuit, History, ShieldEllipsis, PackageSearch, Microscope, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock AI Knowledge Base
const AI_KNOWLEDGE = [
    { type: "product", id: "ID31110000123450121", name: "Susu UHT Full Cream", producer: "PT Ultra Jaya", status: "halal", analysis: "Produk ini telah melalui validasi sistem SIHALAL dengan status aktif. Komposisi susu segar dan penstabil nabati terverifikasi halal." },
    { type: "material", name: "Gelatin Sapi", status: "halal", analysis: "Berdasarkan Fatwa MUI, gelatin sapi halal selama berasal dari penyembelihan secara syar'i. Produk ini umumnya aman jika sudah bersertifikat." },
    { type: "material", name: "Ethanol", status: "warning", analysis: "Analisis AI menunjukkan sumber ethanol menentukan kehalalan. Jika berasal dari industri non-khamr (sintetik) hukumnya mubah dalam kadar tertentu." },
    { type: "material", name: "Carmine (E120)", status: "halal", analysis: "Pewarna merah dari serangga Cochineal. MUI telah memfatwakan halal (Fatwa No. 33 Tahun 2011)." },
];

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("id-check");

    const handleSearch = async () => {
        if (!query) return;
        setIsSearching(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, mode: activeTab }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setResult({
                name: query,
                type: "analysis",
                ...data
            });
        } catch (err: any) {
            console.error("Search Error:", err);
            setError(err.message || "Terjadi kesalahan saat menghubungi UNI AI.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4" />
                    Powered by UNI-Intelligence
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary">
                    Halal Explorer <span className="text-secondary">AI</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Cari produk, cek bahan, atau analisis titik kritis kehalalan dengan bantuan mesin kecerdasan buatan UNI.
                </p>
            </div>

            {/* Smart Search Tabs */}
            <Tabs defaultValue="id-check" className="w-full max-w-3xl mx-auto" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 h-16 bg-white dark:bg-card border-2 border-primary/10 rounded-[2rem] p-1 mb-6">
                    <TabsTrigger value="id-check" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold flex items-center gap-2">
                        <PackageSearch className="w-5 h-5" />
                        Cek ID Halal
                    </TabsTrigger>
                    <TabsTrigger value="analyze" className="rounded-2xl data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground font-bold flex items-center gap-2">
                        <Microscope className="w-5 h-5" />
                        Analisis Bahan
                    </TabsTrigger>
                </TabsList>

                <div className="relative">
                    <div className="flex gap-2 p-2 bg-white dark:bg-card border-2 border-primary/20 rounded-[2rem] shadow-2xl focus-within:border-primary transition-all group overflow-hidden">
                        <div className="flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="w-6 h-6" />
                        </div>
                        <Input
                            placeholder={activeTab === "id-check" ? "Contoh: ID31110000123450121 atau Nama Produk..." : "Contoh: Gelatin, Ethanol, E120..."}
                            className="border-none bg-transparent focus-visible:ring-0 text-lg h-14"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button onClick={handleSearch} className={cn(
                            "h-14 px-10 rounded-2xl font-bold shadow-lg group relative overflow-hidden transition-all",
                            activeTab === "id-check" ? "bg-primary hover:bg-primary/95" : "bg-secondary hover:bg-secondary/95 text-secondary-foreground"
                        )}>
                            <span className="relative z-10 flex items-center gap-2">
                                {isSearching ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {activeTab === "id-check" ? "Verifikasi" : "Analisis"}
                            </span>
                            {isSearching && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer scale-150" />
                            )}
                        </Button>
                    </div>

                    {/* Search Suggestions */}
                    {!result && !isSearching && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {(activeTab === "id-check"
                                ? ["Indomie Goreng", "ID31110000123450121", "Susu Ultra", "Kopi Kenangan"]
                                : ["Gelatin Sapi", "Ethanol", "Pewarna Carmine", "Krim Nabati"]
                            ).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setQuery(s); handleSearch(); }}
                                    className="text-xs font-bold px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all text-muted-foreground"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Tabs>

            {/* Results Area */}
            <div className="min-h-[300px] flex flex-col gap-8">
                {error && (
                    <Card className="border-destructive/20 bg-destructive/5 p-6 rounded-[2rem] animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-4 text-destructive">
                            <AlertTriangle className="w-8 h-8" />
                            <div>
                                <h3 className="font-bold">Galat Analisis AI</h3>
                                <p className="text-sm opacity-80">{error}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary animate-pulse">
                        <BrainCircuit className="w-16 h-16 animate-bounce" />
                        <div className="text-xl font-black tracking-widest uppercase">UNI sedang menganalisis database...</div>
                    </div>
                ) : result === "not_found" ? (
                    <Card className="border-dashed border-2 p-16 text-center bg-muted/20 rounded-[2.5rem]">
                        <div className="max-w-xs mx-auto space-y-6">
                            <div className="bg-muted p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                                <History className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-2xl">Data Belum Tersedia</h3>
                                <p className="text-muted-foreground text-sm">Query Anda belum masuk dalam index kecerdasan kami. UNI akan terus belajar!</p>
                            </div>
                            <Button variant="outline" onClick={() => setQuery("")} className="rounded-xl">Cari Ulang</Button>
                        </div>
                    </Card>
                ) : result ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                        {/* Main Result Card */}
                        <Card className={cn(
                            "lg:col-span-2 overflow-hidden border-none shadow-2xl rounded-[2.5rem]",
                            activeTab === "id-check" ? "bg-white dark:bg-card" : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
                        )}>
                            <div className={cn(
                                "h-2 w-full",
                                result.status === 'halal' ? 'bg-green-500' : result.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                            )} />
                            <CardContent className="p-8 space-y-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                                            activeTab === "id-check" ? "bg-primary/10 text-primary" : "bg-secondary/20 text-secondary"
                                        )}>
                                            {activeTab === 'id-check' ? <Fingerprint className="w-3 h-3" /> : <Microscope className="w-3 h-3" />}
                                            {activeTab === 'id-check' ? 'Official Certificate Verification' : 'Technical Material Audit'}
                                        </div>

                                        <div className="space-y-1">
                                            {result.halalId && (
                                                <div className={cn(
                                                    "text-sm font-mono font-bold opacity-70",
                                                    activeTab === "id-check" ? "text-primary" : "text-secondary"
                                                )}>
                                                    #{result.halalId}
                                                </div>
                                            )}
                                            <h2 className={cn(
                                                "text-5xl font-black leading-tight lowercase first-letter:uppercase",
                                                activeTab === "id-check" ? "text-primary" : "text-white"
                                            )}>
                                                {result.name}
                                            </h2>
                                            {result.producer && (
                                                <p className={cn(
                                                    "text-xl font-bold italic",
                                                    activeTab === "id-check" ? "text-muted-foreground" : "text-slate-400"
                                                )}>
                                                    by {result.producer}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "px-8 py-4 rounded-[2rem] flex flex-col items-center gap-1 border-4 shadow-xl",
                                        result.status === 'halal' ? 'bg-green-500 text-white border-green-400' :
                                            result.status === 'warning' ? 'bg-amber-500 text-white border-amber-400' :
                                                'bg-destructive text-white border-red-400'
                                    )}>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Status</div>
                                        <div className="flex items-center gap-2 text-2xl font-black">
                                            {result.status === 'halal' ? <CheckCircle2 className="w-7 h-7 text-white" /> : <AlertTriangle className="w-7 h-7 text-white" />}
                                            <span className="uppercase">{result.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "p-8 rounded-[2.5rem] border-2 space-y-4",
                                    activeTab === "id-check" ? "bg-muted/30 border-primary/5" : "bg-white/5 border-white/10"
                                )}>
                                    <div className="flex items-center gap-2 font-bold opacity-80 uppercase text-xs tracking-widest">
                                        <BrainCircuit className="w-4 h-4 text-secondary" />
                                        {activeTab === 'analyze' ? 'Deep AI Analysis' : 'Registry Intelligence'}
                                    </div>
                                    <p className="text-xl leading-relaxed italic font-medium">
                                        "{result.analysis}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.issueDate && (
                                        <div className={cn(
                                            "flex items-center gap-4 p-5 rounded-3xl border shadow-inner",
                                            activeTab === "id-check" ? "bg-white border-primary/10" : "bg-slate-800/50 border-white/5"
                                        )}>
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase opacity-60 tracking-wider">Tanggal Terbit</div>
                                                <div className="font-bold text-lg">{result.issueDate}</div>
                                            </div>
                                        </div>
                                    )}

                                    {result.recommendation && (
                                        <div className={cn(
                                            "flex items-center gap-4 p-5 rounded-3xl border shadow-inner",
                                            activeTab === "id-check" ? "bg-primary/5 border-primary/10" : "bg-secondary/5 border-secondary/10"
                                        )}>
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                                activeTab === "id-check" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                                            )}>
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase opacity-60 tracking-wider">Rekomendasi UNI</div>
                                                <div className="text-sm font-bold leading-tight">{result.recommendation}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Side Panels */}
                        <div className="space-y-6">
                            {activeTab === "analyze" ? (
                                <Card className="p-8 bg-black text-white border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                                    <h3 className="font-black text-2xl mb-6 flex items-center gap-2 relative z-10 text-secondary">
                                        <Microscope className="w-7 h-7" />
                                        Titik Kritis
                                    </h3>
                                    <div className="space-y-4 relative z-10">
                                        {result.criticalPoints?.map((cp: string, i: number) => (
                                            <div key={i} className="flex gap-4 items-start p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0 shadow-[0_0_10px_rgba(var(--secondary),0.5)]" />
                                                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                                    {cp}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-8 bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                                    <h3 className="font-black text-2xl mb-6 flex items-center gap-2 text-primary">
                                        <PackageSearch className="w-7 h-7" />
                                        Validasi BPJPH
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white rounded-2xl border border-primary/5 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Sertifikasi Melalui</p>
                                            <p className="font-black text-primary">{result.lphName || "Lembaga Pemeriksa Halal"}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-primary/5 shadow-sm">
                                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Kepastian Hukum</p>
                                            <p className="text-xs font-medium leading-relaxed italic text-muted-foreground">"Berdasarkan UU No. 33 Tahun 2014, produk ini telah memenuhi standar kehalalan Indonesia."</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Card className="p-6 border-none bg-slate-100 dark:bg-slate-800/50 rounded-[2rem]">
                                <h3 className="font-bold text-slate-500 mb-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldEllipsis className="w-4 h-4" /> AI Guard Transparency
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
                                    Hasil ini diolah oleh UNI Intelligence. Gunakan hanya sebagai alat bantu pendukung keputusan, bukan sebagai satu-satunya dokumen hukum.
                                </p>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
                        <FeatureCard
                            icon={Fingerprint}
                            title="Verifikasi Sertifikat"
                            desc="Cek validitas nomor sertifikat halal dari BPJPH secara instan."
                        />
                        <FeatureCard
                            icon={ShieldEllipsis}
                            title="Database Bahan"
                            desc="Ribuan basis data bahan tambahan pangan (BTP) dengan status kehalalannya."
                        />
                        <FeatureCard
                            icon={BrainCircuit}
                            title="Analisis Titik Kritis"
                            desc="AI mendeteksi potensi kontaminasi atau bahan haram pada produk rumit."
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) rotate(45deg); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <Card className="p-8 border-none bg-white/40 dark:bg-card/40 backdrop-blur-sm shadow-xl rounded-[2.5rem] hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-primary">{title}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
                {desc}
            </p>
        </Card>
    );
}

