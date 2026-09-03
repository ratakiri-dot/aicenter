"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, CheckCircle2, AlertTriangle, BrainCircuit, History, ShieldEllipsis, Microscope, Calendar, User, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Synchronized User Identity State (matching Chatbot page)
    const [userName, setUserName] = useState<string>("");
    const [nameInput, setNameInput] = useState<string>("");
    const [showNameModal, setShowNameModal] = useState<boolean>(false);

    useEffect(() => {
        const savedName = localStorage.getItem("uni_chat_username");
        if (savedName) {
            setUserName(savedName);
        }
    }, []);

    const handleSaveName = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed) return;
        localStorage.setItem("uni_chat_username", trimmed);
        setUserName(trimmed);
        setShowNameModal(false);
    };

    const handleSearch = async () => {
        if (!query) return;
        setIsSearching(true);
        setResult(null);
        setError(null);

        try {
            const currentUserId = userName || (typeof window !== "undefined" && localStorage.getItem("uni_chat_username")) || "anonymous";
            const res = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, mode: "analyze", userId: currentUserId }),
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
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Modal Identitas Pengguna */}
            {showNameModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-card p-8 rounded-3xl max-w-md w-full shadow-2xl border border-primary/10 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                                <User className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-primary">Identitas Pengguna</h3>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                Masukkan nama Anda/usaha Anda untuk dicatat saat melakukan pencarian Bahan Kritis di Google Sheets.
                            </p>
                        </div>
                        <form onSubmit={handleSaveName} className="space-y-4">
                            <Input
                                autoFocus
                                placeholder="Contoh: Ahmad (Resto Padang Jaya)"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="h-14 rounded-xl border-2 border-primary/20 focus-visible:ring-primary px-4 text-sm"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNameModal(false)}
                                    className="flex-1 h-12 rounded-xl text-xs font-bold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!nameInput.trim()}
                                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-lg shadow-primary/20"
                                >
                                    Simpan Nama
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center space-y-4 relative">
                {/* User Identity Pill Button (Top Right) */}
                <div className="flex justify-center md:absolute md:top-0 md:right-0">
                    {userName ? (
                        <button
                            onClick={() => {
                                setNameInput(userName);
                                setShowNameModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer shadow-sm"
                            title="Klik untuk mengubah nama pencatat"
                        >
                            <User className="w-4 h-4 text-primary" />
                            <span>{userName}</span>
                            <Edit3 className="w-3 h-3 text-muted-foreground ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setNameInput("");
                                setShowNameModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/20 transition-all cursor-pointer shadow-sm"
                        >
                            <User className="w-4 h-4 text-secondary" />
                            <span>+ Set Nama Pengguna</span>
                        </button>
                    )}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4" />
                    Powered by UNI-Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                    Analisis Bahan/ <span className="text-secondary">Titik Kritis Bahan</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Analisis titik kritis kehalalan berbagai bahan dengan bantuan mesin kecerdasan buatan UNI.
                </p>
            </div>

            {/* Smart Search */}
            <div className="w-full max-w-3xl mx-auto">
                <div className="relative">
                    <div className="flex gap-2 p-2 bg-white dark:bg-card border-2 border-primary/20 rounded-[2rem] shadow-2xl focus-within:border-primary transition-all group overflow-hidden">
                        <div className="flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="w-6 h-6" />
                        </div>
                        <Input
                            placeholder="Contoh: Gelatin, Ethanol, Krim Nabati..."
                            className="border-none bg-transparent focus-visible:ring-0 text-lg h-14"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button onClick={handleSearch} className={cn(
                            "h-14 px-10 rounded-2xl font-bold shadow-lg group relative overflow-hidden transition-all bg-secondary hover:bg-secondary/95 text-secondary-foreground"
                        )}>
                            <span className="relative z-10 flex items-center gap-2">
                                {isSearching ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Analisis
                            </span>
                            {isSearching && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer scale-150" />
                            )}
                        </Button>
                    </div>

                    {/* Search Suggestions */}
                    {!result && !isSearching && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {["Gelatin Sapi", "Ethanol", "Pewarna Carmine", "Krim Nabati"].map(s => (
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
            </div>

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
                        <Card className="lg:col-span-2 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <div className={cn(
                                "h-2 w-full",
                                result.status === 'halal' ? 'bg-green-500' : result.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                            )} />
                            <CardContent className="p-8 space-y-8">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-secondary/20 text-secondary">
                                            <Microscope className="w-3 h-3" />
                                            Technical Material Audit
                                        </div>

                                        <div className="space-y-1">
                                            <h2 className="text-5xl font-black leading-tight lowercase first-letter:uppercase text-white">
                                                {result.name}
                                            </h2>
                                            {result.producer && (
                                                <p className="text-xl font-bold italic text-slate-400">
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

                                <div className="p-8 rounded-[2.5rem] border-2 space-y-4 bg-white/5 border-white/10">
                                    <div className="flex items-center gap-2 font-bold opacity-80 uppercase text-xs tracking-widest">
                                        <BrainCircuit className="w-4 h-4 text-secondary" />
                                        Deep AI Analysis
                                    </div>
                                    <p className="text-xl leading-relaxed italic font-medium">
                                        "{result.analysis}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.issueDate && (
                                        <div className="flex items-center gap-4 p-5 rounded-3xl border shadow-inner bg-slate-800/50 border-white/5">
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
                                        <div className="flex items-center gap-4 p-5 rounded-3xl border shadow-inner bg-secondary/5 border-secondary/10">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary/10 text-secondary">
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

                            <Card className="p-6 border-none bg-slate-100 dark:bg-slate-800/50 rounded-[2rem]">
                                <h3 className="font-bold text-slate-500 mb-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <ShieldEllipsis className="w-4 h-4" /> AI Guard Transparency
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
                                    Hasil ini diolah oleh UNI Intelligence. Gunakan hanya sebagai alat pendukung keputusan, bukan sebagai dokumen hukum.
                                </p>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
                        <FeatureCard
                            icon={Microscope}
                            title="Analisis Bahan"
                            desc="Cari titik kritis dari bahan-bahan yang umum digunakan dalam pengolahan pangan."
                        />
                        <FeatureCard
                            icon={ShieldEllipsis}
                            title="Database Bahan"
                            desc="Didukung oleh pengetahuan AI khusus mengenai Bahan Tambahan Pangan (BTP)."
                        />
                        <FeatureCard
                            icon={BrainCircuit}
                            title="Titik Kritis"
                            desc="AI menyajikan panduan mendalam seputar batasan halal-haram suatu bahan sintetik atau alami."
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
