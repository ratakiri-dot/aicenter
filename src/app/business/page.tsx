"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Sparkles,
    PenTool,
    Camera,
    Copy,
    Download,
    RefreshCcw,
    ShoppingBag,
    Instagram,
    MessageCircle,
    BrainCircuit,
    Wand2,
    Image as ImageIcon,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusinessPage() {
    // Copywriting State
    const [productName, setProductName] = useState("");
    const [features, setFeatures] = useState("");
    const [tone, setTone] = useState("Persuasif");
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
    const [generatedCopy, setGeneratedCopy] = useState<any>(null);

    // Photo AI State
    const [photoPrompt, setPhotoPrompt] = useState("");
    const [photoStyle, setPhotoStyle] = useState("Studio Minimalis");
    const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState("");
    const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleGenerateCopy = async () => {
        if (!productName) return;
        setIsGeneratingCopy(true);
        try {
            const res = await fetch("/api/ai/copywriting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productName, features, tone }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setGeneratedCopy(data);
        } catch (error) {
            console.error("Copywriting Error:", error);
            // Fallback content or error message
        } finally {
            setIsGeneratingCopy(false);
        }
    };

    const handleGeneratePhoto = async () => {
        if (!photoPrompt) return;
        setIsGeneratingPhoto(true);
        setGeneratedPhoto(null);

        const phases = [
            "Menganalisis pencahayaan...",
            "Membangun komposisi studio...",
            "Menghaluskan tekstur produk...",
            "Final rendering..."
        ];

        let phaseIdx = 0;
        setLoadingPhase(phases[0]);
        const phaseInterval = setInterval(() => {
            phaseIdx++;
            setLoadingPhase(phases[phaseIdx % phases.length]);
        }, 2500);

        try {
            const res = await fetch("/api/ai/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: photoPrompt, style: photoStyle, image: uploadedImage }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Gagal menghubungi server AI");
            }

            const data = await res.json();
            if (data.imageUrl) {
                setGeneratedPhoto(data.imageUrl);
            } else {
                throw new Error("Gambar tidak dapat dibuat");
            }
        } catch (error: any) {
            console.error("Photo Generation Error:", error);
            alert("Maaf, terjadi masalah saat membuat foto: " + error.message);
        } finally {
            clearInterval(phaseInterval);
            setIsGeneratingPhoto(false);
            setLoadingPhase("");
        }
    };

    const handleDownloadPhoto = async () => {
        if (!generatedPhoto) return;
        try {
            const response = await fetch(generatedPhoto);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-product-photo-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            alert("Gagal mendownload gambar. Silakan coba lagi.");
        }
    };

    const handleRegeneratePhoto = () => {
        handleGeneratePhoto();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUploadedImage(base64String);
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/5 border border-rose-500/10 text-rose-600 text-xs font-black uppercase tracking-wider">
                    <Wand2 className="w-4 h-4" />
                    Growth Kit for UMKM
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary leading-tight">
                    Scale Your Business <br />
                    <span className="text-rose-500">with Creative AI</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                    Tingkatkan penjualan produk halal Anda dengan bantuan AI LPH UNISMA. Buat iklan menarik dan foto produk profesional dalam hitungan detik.
                </p>
            </div>

            <Tabs defaultValue="copywriting" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full max-w-md border shadow-inner">
                        <TabsTrigger
                            value="copywriting"
                            className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-sm flex-1 gap-2"
                        >
                            <PenTool className="w-4 h-4" />
                            AI Copywriting
                        </TabsTrigger>
                        <TabsTrigger
                            value="photo"
                            className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-sm flex-1 gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            AI Product Photo
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* AI Copywriting Tab */}
                <TabsContent value="copywriting" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Control Panel */}
                        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-card overflow-hidden">
                            <div className="h-2 w-full bg-rose-500" />
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <ShoppingBag className="w-3 h-3" /> Nama Produk
                                    </label>
                                    <Input
                                        placeholder="Contoh: Sambel Bawang Mak Uni"
                                        className="h-12 rounded-xl"
                                        value={productName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <Layout className="w-3 h-3" /> Keunggulan / Fitur
                                    </label>
                                    <Textarea
                                        placeholder="Contoh: Pedas mantap, tanpa pengawet, sertifikat halal LPH UNISMA"
                                        className="min-h-[120px] rounded-xl"
                                        value={features}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeatures(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Tone Iklan</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Persuasif", "Formal", "Lucu", "Mendesak"].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTone(t)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                                                    tone === t ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-muted text-muted-foreground border-transparent hover:border-rose-500/20"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleGenerateCopy}
                                    disabled={isGeneratingCopy}
                                    className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30 text-lg font-black gap-2 mt-4"
                                >
                                    {isGeneratingCopy ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    Generate Copy
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Result Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {!generatedCopy ? (
                                <Card className="h-full border-dashed border-2 flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-[2.5rem] min-h-[400px]">
                                    <BrainCircuit className="w-16 h-16 text-muted-foreground/30 mb-6" />
                                    <h3 className="text-xl font-bold text-muted-foreground">Isi data produk untuk mulai membuat copy iklan otomatis.</h3>
                                </Card>
                            ) : (
                                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                                    <CopyCard
                                        icon={Instagram}
                                        title="Instagram / Social Media"
                                        content={generatedCopy.instagram}
                                        onCopy={() => copyToClipboard(generatedCopy.instagram)}
                                    />
                                    <CopyCard
                                        icon={MessageCircle}
                                        title="WhatsApp Broadcast"
                                        content={generatedCopy.whatsapp}
                                        onCopy={() => copyToClipboard(generatedCopy.whatsapp)}
                                    />
                                    <CopyCard
                                        icon={Layout}
                                        title="Website Landing Page"
                                        content={generatedCopy.landing}
                                        onCopy={() => copyToClipboard(generatedCopy.landing)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* AI Product Photo Tab */}
                <TabsContent value="photo" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Photo Controls */}
                        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-card overflow-hidden">
                            <div className="h-2 w-full bg-rose-500" />
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Upload Produk (Opsional)</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-4 py-2 w-full border-dashed border-2">
                                                <Camera className="w-4 h-4 mr-2" />
                                                {previewImage ? "Ganti Foto" : "Pilih Foto Produk"}
                                            </label>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        {previewImage && (
                                            <div className="relative w-full h-32 rounded-xl overflow-hidden border">
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => { setUploadedImage(null); setPreviewImage(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
                                                >
                                                    <RefreshCcw className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Inspirasi Deskripsi</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: "🌶️ Sambal Bawang", prompt: "Botol kaca sambal bawang berminyak di atas talenan kayu dengan cabai segar di sekitarnya" },
                                            { label: "🍯 Madu Murni", prompt: "Botol madu dengan madu keemasan yang kental, latar belakang bunga liar dan sinar matahari" },
                                            { label: "☕ Kopi Susu", prompt: "Gelas plastik kopi susu dingin dengan embun air, di atas meja kafe minimalis" },
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPhotoPrompt(item.prompt)}
                                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-muted hover:bg-rose-500/10 hover:text-rose-600 border border-transparent hover:border-rose-500/20 transition-all text-muted-foreground"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                    <Textarea
                                        placeholder="Contoh: Sepatu lari merah di atas meja kayu minimalis..."
                                        className="min-h-[120px] rounded-xl text-lg font-medium leading-relaxed"
                                        value={photoPrompt}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPhotoPrompt(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Pilih Gaya Foto</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Studio Minimalis", "Cinematic Luxury", "Outdoor Nature", "Vintage Cafe", "Futuristic"].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setPhotoStyle(s)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                                                    photoStyle === s ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-muted text-muted-foreground border-transparent hover:border-rose-500/20"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col items-center gap-2 cursor-pointer hover:border-rose-500/50 transition-all border-rose-500/20 bg-rose-500/5">
                                        <ImageIcon className="w-6 h-6 text-rose-500" />
                                        <div className="text-center">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-rose-500">Premium Flux</div>
                                            <div className="text-[8px] text-rose-400/70 font-bold">Ultra Realistic</div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col items-center gap-2 cursor-not-allowed opacity-50">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">8K Photorealistic</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleGeneratePhoto}
                                    disabled={isGeneratingPhoto}
                                    className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30 text-lg font-black gap-2 mt-4"
                                >
                                    {isGeneratingPhoto ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                    Generate Photo
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Photo Result Area */}
                        <div className="lg:col-span-3">
                            <Card className="h-full border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-card overflow-hidden relative min-h-[500px] flex items-center justify-center">
                                {isGeneratingPhoto ? (
                                    <div className="flex flex-col items-center gap-6 animate-pulse">
                                        <div className="w-24 h-24 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                            <Wand2 className="w-12 h-12" />
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <h3 className="text-xl font-black uppercase tracking-widest text-primary">UNI AI is Painting...</h3>
                                            <p className="text-sm text-rose-500 font-bold animate-pulse">{loadingPhase || "Menganalisis visi estetika..."}</p>
                                        </div>
                                    </div>
                                ) : generatedPhoto ? (
                                    <div className="absolute inset-0 group">
                                        <img src={generatedPhoto} alt="Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" crossOrigin="anonymous" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <Button onClick={handleDownloadPhoto} size="lg" className="rounded-xl bg-white text-black hover:bg-white/90 font-black">
                                                <Download className="w-5 h-5 mr-2" />
                                                Download HD
                                            </Button>
                                            <Button onClick={handleRegeneratePhoto} size="lg" variant="outline" className="rounded-xl border-white text-white hover:bg-white/20 font-black">
                                                <RefreshCcw className="w-5 h-5 mr-2" />
                                                Regenerate
                                            </Button>
                                        </div>
                                        <div className="absolute top-6 left-6 px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            AI Generated Result
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center p-12 gap-6">
                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                                            <Camera className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-muted-foreground">Studio Foto AI Anda</h3>
                                            <p className="text-sm text-muted-foreground max-w-sm">Jelaskan bagaimana produk Anda ingin difoto, dan UNI akan membuatnya tampak premium.</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* AI Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                <Card className="p-8 bg-black text-white border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 blur-[100px] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Tips AI Selling</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Selalu sebutkan **"Sertifikasi Halal"** di bagian awal copywriting untuk membangun kepercayaan (Trust) instan pada pasar Muslim.
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-8 bg-rose-500 text-white border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white blur-[100px] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white flex-shrink-0 flex items-center justify-center text-rose-500 shadow-lg">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Visual Terbaik</h3>
                            <p className="text-sm text-rose-100 leading-relaxed font-medium">
                                Gunakan latar belakang yang bersih dan minimalis dalam deskripsi foto agar produk utama tetap menjadi perhatian utama mata pembeli.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function CopyCard({ icon: Icon, title, content, onCopy }: { icon: any, title: string, content: string, onCopy: () => void }) {
    return (
        <Card className="border-none shadow-xl bg-white dark:bg-card rounded-[2rem] overflow-hidden group">
            <div className="p-6 flex items-center justify-between border-b bg-muted/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-black text-primary text-sm uppercase tracking-wider">{title}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onCopy} className="rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-8">
                <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                    {content}
                </p>
            </div>
        </Card>
    );
}
