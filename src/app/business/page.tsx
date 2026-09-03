"use client";

import { useState, useRef } from "react";
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
    Layout,
    LayoutTemplate,
    CheckCircle2,
    ShieldCheck,
    Tag,
    Palette,
    FileText,
    Share2,
    Phone,
    UploadCloud,
    Trash2,
    Maximize2
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

    // Flyer AI & Customizer State
    const flyerRef = useRef<HTMLDivElement>(null);
    const [flyerProductName, setFlyerProductName] = useState("Keripik Tempe Halal UNISMA");
    const [flyerHeadline, setFlyerHeadline] = useState("KRENYEZNYA BIKIN KETAGIHAN!");
    const [flyerSubheadline, setFlyerSubheadline] = useState("Camilan Renyah Alami 100% Halal & Tanpa Pengawet");
    const [flyerOriginalPrice, setFlyerOriginalPrice] = useState("Rp 25.000");
    const [flyerPromoPrice, setFlyerPromoPrice] = useState("Rp 18.000");
    const [flyerBadgeText, setFlyerBadgeText] = useState("PROMO HEMAT 28%");
    const [flyerWhatsapp, setFlyerWhatsapp] = useState("0812-3456-7890");
    const [flyerInstagram, setFlyerInstagram] = useState("@tempe.unisma.halal");
    const [flyerHighlightsText, setFlyerHighlightsText] = useState("🌶️ Bumbu Rempah Alami\n📜 Sertifikat Halal LPH UNISMA\n📦 Siap Kirim Seluruh Indonesia");
    const [flyerTheme, setFlyerTheme] = useState<"bold" | "halal" | "minimal" | "sweet">("bold");
    const [flyerAspectRatio, setFlyerAspectRatio] = useState<"1:1" | "9:16">("1:1");
    const [flyerImageStyle, setFlyerImageStyle] = useState<"card" | "banner" | "circle">("card");
    const [showHalalBadge, setShowHalalBadge] = useState(true);
    const [flyerImage, setFlyerImage] = useState<string | null>(null);
    const [isGeneratingFlyerAI, setIsGeneratingFlyerAI] = useState(false);
    const [isExportingFlyer, setIsExportingFlyer] = useState(false);

    // Copywriting Handlers
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
        } finally {
            setIsGeneratingCopy(false);
        }
    };

    // Photo Handlers
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

    // Flyer AI Handlers
    const handleGenerateFlyerAI = async () => {
        setIsGeneratingFlyerAI(true);
        try {
            const res = await fetch("/api/ai/flyer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: flyerProductName || productName,
                    productDescription: features || flyerSubheadline,
                    promoText: flyerBadgeText,
                    style: flyerTheme
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.headline) setFlyerHeadline(data.headline);
            if (data.subheadline) setFlyerSubheadline(data.subheadline);
            if (data.badgeText) setFlyerBadgeText(data.badgeText);
            if (data.highlights && Array.isArray(data.highlights)) {
                setFlyerHighlightsText(data.highlights.join("\n"));
            }
        } catch (error: any) {
            console.error("Flyer AI Error:", error);
            alert("Gagal menggenerasi teks flyer: " + error.message);
        } finally {
            setIsGeneratingFlyerAI(false);
        }
    };

    const handleFlyerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFlyerImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownloadFlyer = async () => {
        if (!flyerRef.current) return;
        setIsExportingFlyer(true);
        try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(flyerRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                quality: 0.95
            });
            const link = document.createElement("a");
            link.download = `flyer-${(flyerProductName || "produk").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export Flyer Error:", error);
            alert("Gagal mengunduh flyer. Pastikan foto pendukung berformat valid.");
        } finally {
            setIsExportingFlyer(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Helper highlights array
    const flyerHighlightsList = flyerHighlightsText
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);

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
                    Tingkatkan penjualan produk halal Anda dengan bantuan AI LPH UNISMA. Buat iklan menarik, foto produk profesional, dan flyer jualan estetik dalam hitungan detik.
                </p>
            </div>

            <Tabs defaultValue="copywriting" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full max-w-xl border shadow-inner">
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
                        <TabsTrigger
                            value="flyer"
                            className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-sm flex-1 gap-2"
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            Desain Flyer AI
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
                                            <div className="text-[10px] font-black uppercase tracking-widest text-rose-500">Premium UNI</div>
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

                {/* AI Flyer Generator Tab */}
                <TabsContent value="flyer" className="space-y-8 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Control Panel (5 cols) */}
                        <Card className="lg:col-span-5 border-none shadow-2xl rounded-[2.5rem] bg-white dark:bg-card overflow-hidden">
                            <div className="h-2 w-full bg-rose-500" />
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-black tracking-tight text-primary flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-rose-500" />
                                        Studio Flyer Jualan
                                    </h2>
                                    <Button
                                        onClick={handleGenerateFlyerAI}
                                        disabled={isGeneratingFlyerAI}
                                        size="sm"
                                        className="rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white font-bold border border-rose-500/20 text-xs gap-1.5 transition-all"
                                    >
                                        {isGeneratingFlyerAI ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-rose-500" />}
                                        AI Magic Content
                                    </Button>
                                </div>

                                {/* Prominent Photo Upload Section */}
                                <div className="p-4 rounded-2xl bg-muted/40 border-2 border-dashed border-rose-500/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-rose-600 flex items-center gap-1.5">
                                            <Camera className="w-4 h-4 text-rose-500" /> Upload Foto Produk Flyer
                                        </label>
                                        {flyerImage && (
                                            <button
                                                onClick={() => setFlyerImage(null)}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" /> Hapus
                                            </button>
                                        )}
                                    </div>

                                    {flyerImage ? (
                                        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border group shadow-md">
                                            <img src={flyerImage} alt="Uploaded Flyer Product" className="w-full h-full object-cover" />
                                            <label htmlFor="flyer-image-input" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer gap-1.5">
                                                <UploadCloud className="w-4 h-4" /> Ganti Foto Produk
                                            </label>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="flyer-image-input"
                                            className="w-full h-28 rounded-xl border border-input bg-background/80 hover:bg-rose-500/5 hover:border-rose-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer p-3 gap-1.5 group"
                                        >
                                            <UploadCloud className="w-7 h-7 text-rose-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-primary">Klik untuk Pilih / Unggah Foto Produk</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">Format PNG, JPG, atau WEBP</span>
                                        </label>
                                    )}

                                    <input
                                        id="flyer-image-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFlyerImageUpload}
                                    />

                                    {/* Option to use generated photo from AI Studio if available */}
                                    {generatedPhoto && (
                                        <Button
                                            onClick={() => setFlyerImage(generatedPhoto)}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl gap-1.5"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                            Gunakan Hasil Foto AI Studio
                                        </Button>
                                    )}

                                    {/* Image Layout Frame Picker */}
                                    {flyerImage && (
                                        <div className="space-y-1.5 pt-2 border-t border-border/50">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tampilan Frame Foto</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: "card", label: "Kartu Studio" },
                                                    { id: "banner", label: "Hero Banner" },
                                                    { id: "circle", label: "Lingkaran Pop" },
                                                ].map((s) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setFlyerImageStyle(s.id as any)}
                                                        className={cn(
                                                            "flex-1 py-1 px-2 rounded-lg text-[10px] font-bold border transition-all",
                                                            flyerImageStyle === s.id
                                                                ? "bg-rose-500 text-white border-rose-500"
                                                                : "bg-muted text-muted-foreground border-transparent hover:border-rose-500/20"
                                                        )}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form Input Controls */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5" /> Nama Produk
                                        </label>
                                        <Input
                                            placeholder="Contoh: Keripik Tempe Halal"
                                            className="h-11 rounded-xl font-medium"
                                            value={flyerProductName}
                                            onChange={(e) => setFlyerProductName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" /> Headline Promo
                                        </label>
                                        <Input
                                            placeholder="Contoh: SENSASI PEDAS MANTAP!"
                                            className="h-11 rounded-xl font-medium"
                                            value={flyerHeadline}
                                            onChange={(e) => setFlyerHeadline(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                                            Sub-headline / Tagline
                                        </label>
                                        <Input
                                            placeholder="Contoh: Olahan kedelai lokal 100% Halal"
                                            className="h-11 rounded-xl font-medium"
                                            value={flyerSubheadline}
                                            onChange={(e) => setFlyerSubheadline(e.target.value)}
                                        />
                                    </div>

                                    {/* Price & Badge */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Harga Normal</label>
                                            <Input
                                                placeholder="Rp 25.000"
                                                className="h-10 rounded-xl text-xs"
                                                value={flyerOriginalPrice}
                                                onChange={(e) => setFlyerOriginalPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-rose-500">Harga Promo</label>
                                            <Input
                                                placeholder="Rp 18.000"
                                                className="h-10 rounded-xl text-xs font-bold border-rose-500/40 text-rose-600"
                                                value={flyerPromoPrice}
                                                onChange={(e) => setFlyerPromoPrice(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Badge Promo</label>
                                            <Input
                                                placeholder="DISKON 20%"
                                                className="h-10 rounded-xl text-xs"
                                                value={flyerBadgeText}
                                                onChange={(e) => setFlyerBadgeText(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Highlights */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5" /> Poin Keunggulan (1 baris per poin)
                                        </label>
                                        <Textarea
                                            placeholder="🌶️ Bumbu Rempah Alami&#10;📜 Sertifikat Halal LPH UNISMA&#10;📦 Siap Kirim Seluruh Indonesia"
                                            className="min-h-[85px] rounded-xl text-xs font-medium"
                                            value={flyerHighlightsText}
                                            onChange={(e) => setFlyerHighlightsText(e.target.value)}
                                        />
                                    </div>

                                    {/* Contacts */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-green-500" /> WhatsApp
                                            </label>
                                            <Input
                                                placeholder="0812-xxxx-xxxx"
                                                className="h-10 rounded-xl text-xs"
                                                value={flyerWhatsapp}
                                                onChange={(e) => setFlyerWhatsapp(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                                <Instagram className="w-3 h-3 text-pink-500" /> Instagram
                                            </label>
                                            <Input
                                                placeholder="@nama.toko"
                                                className="h-10 rounded-xl text-xs"
                                                value={flyerInstagram}
                                                onChange={(e) => setFlyerInstagram(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Halal Badge Toggle */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">Badge Halal LPH UNISMA</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={showHalalBadge}
                                            onChange={(e) => setShowHalalBadge(e.target.checked)}
                                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                        />
                                    </div>

                                    {/* Preset Visual Selector */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                            Pilih Tema Visual Flyer
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: "bold", name: "🔴 Flash Sale Bold", color: "from-red-600 to-amber-500" },
                                                { id: "halal", name: "🌿 Halal Culinary", color: "from-emerald-900 to-teal-800" },
                                                { id: "minimal", name: "☕ Modern Luxury", color: "from-slate-900 to-zinc-900" },
                                                { id: "sweet", name: "🍊 Sweet & Fun", color: "from-rose-500 to-amber-400" },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setFlyerTheme(t.id as any)}
                                                    className={cn(
                                                        "p-3 rounded-xl border text-left text-xs font-bold transition-all relative overflow-hidden flex items-center justify-between",
                                                        flyerTheme === t.id
                                                            ? "border-rose-500 bg-rose-500/10 text-rose-600 ring-2 ring-rose-500/20"
                                                            : "border-border hover:border-rose-500/40 text-muted-foreground"
                                                    )}
                                                >
                                                    <span>{t.name}</span>
                                                    <div className={cn("w-3 h-3 rounded-full bg-gradient-to-br", t.color)} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Aspect Ratio Selector */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                                            Ukuran Poster (Format)
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setFlyerAspectRatio("1:1")}
                                                className={cn(
                                                    "flex-1 py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2",
                                                    flyerAspectRatio === "1:1" ? "bg-rose-500 text-white border-rose-500" : "bg-muted text-muted-foreground border-transparent"
                                                )}
                                            >
                                                <div className="w-3.5 h-3.5 border-2 border-current rounded-sm" />
                                                1:1 Feed Post
                                            </button>
                                            <button
                                                onClick={() => setFlyerAspectRatio("9:16")}
                                                className={cn(
                                                    "flex-1 py-2 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2",
                                                    flyerAspectRatio === "9:16" ? "bg-rose-500 text-white border-rose-500" : "bg-muted text-muted-foreground border-transparent"
                                                )}
                                            >
                                                <div className="w-2.5 h-4 border-2 border-current rounded-sm" />
                                                9:16 Story / WA
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Button */}
                                <Button
                                    onClick={handleDownloadFlyer}
                                    disabled={isExportingFlyer}
                                    className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30 text-lg font-black gap-2 mt-4"
                                >
                                    {isExportingFlyer ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                    Download Flyer HD (PNG)
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Right Studio Live Flyer Canvas (7 cols) */}
                        <div className="lg:col-span-7 space-y-4 flex flex-col items-center">
                            <div className="w-full flex items-center justify-between px-2">
                                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-rose-500" />
                                    Live Canvas Studio ({flyerAspectRatio})
                                </div>
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                                    Siap Download PNG HD
                                </span>
                            </div>

                            {/* Flyer Live Canvas Box */}
                            <div className="w-full flex justify-center overflow-auto p-2">
                                <div
                                    ref={flyerRef}
                                    className={cn(
                                        "relative overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between p-6 md:p-8 rounded-[2rem]",
                                        flyerAspectRatio === "1:1" ? "w-full max-w-[480px] aspect-square" : "w-full max-w-[420px] aspect-[9/16]",
                                        flyerTheme === "bold" && "bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 text-white",
                                        flyerTheme === "halal" && "bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-amber-100",
                                        flyerTheme === "minimal" && "bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-900 text-white",
                                        flyerTheme === "sweet" && "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 text-white"
                                    )}
                                >
                                    {/* Ambient Decorative Shapes */}
                                    <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 blur-3xl rounded-full pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/20 blur-2xl rounded-full pointer-events-none" />

                                    {/* Header Bar: Halal Seal & Promo Badge */}
                                    <div className="relative z-10 flex items-start justify-between gap-4">
                                        {/* Halal Official Badge */}
                                        {showHalalBadge ? (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider leading-none text-white">
                                                    LPH UNISMA HALAL VERIFIED
                                                </span>
                                            </div>
                                        ) : <div />}

                                        {/* Promo Discount Pill */}
                                        {flyerBadgeText && (
                                            <div className={cn(
                                                "px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl border animate-bounce",
                                                flyerTheme === "bold" && "bg-yellow-400 text-red-950 border-yellow-300",
                                                flyerTheme === "halal" && "bg-amber-400 text-emerald-950 border-amber-300",
                                                flyerTheme === "minimal" && "bg-rose-500 text-white border-rose-400",
                                                flyerTheme === "sweet" && "bg-white text-rose-600 border-white"
                                            )}>
                                                {flyerBadgeText}
                                            </div>
                                        )}
                                    </div>

                                    {/* Center Body Content */}
                                    <div className="relative z-10 my-4 space-y-4 flex-1 flex flex-col justify-center">
                                        {/* Product Photo insert if uploaded */}
                                        {flyerImage ? (
                                            <div className={cn(
                                                "relative w-full overflow-hidden border-2 border-white/30 shadow-2xl transition-all duration-300",
                                                flyerImageStyle === "card" && "h-44 md:h-52 rounded-2xl",
                                                flyerImageStyle === "banner" && "h-48 md:h-56 rounded-3xl",
                                                flyerImageStyle === "circle" && "w-36 h-36 md:w-44 md:h-44 rounded-full mx-auto border-4 shadow-rose-950/40"
                                            )}>
                                                <img src={flyerImage} alt="Flyer Product" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="flyer-image-input"
                                                className="w-full py-6 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer hover:bg-white/20 transition-colors"
                                            >
                                                <UploadCloud className="w-8 h-8 opacity-80" />
                                                <span className="text-xs font-black uppercase tracking-widest opacity-90">{flyerProductName || "NAMA PRODUK UMKM"}</span>
                                                <span className="text-[10px] underline opacity-75">Klik untuk Upload Foto Produk</span>
                                            </label>
                                        )}

                                        {/* Headline & Subheadline */}
                                        <div className="space-y-1 text-center">
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase drop-shadow-md">
                                                {flyerHeadline || "PROMO SPESIAL HALAL"}
                                            </h2>
                                            <p className="text-xs md:text-sm font-medium opacity-90 leading-relaxed max-w-sm mx-auto">
                                                {flyerSubheadline}
                                            </p>
                                        </div>

                                        {/* Highlights list */}
                                        {flyerHighlightsList.length > 0 && (
                                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 space-y-1.5 border border-white/10 text-xs">
                                                {flyerHighlightsList.map((hl, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                                        <span className="truncate">{hl}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer: Price Tag & Contact CTA */}
                                    <div className="relative z-10 space-y-3 pt-3 border-t border-white/20">
                                        <div className="flex items-center justify-between">
                                            {/* Price Section */}
                                            <div className="flex items-baseline gap-2">
                                                {flyerOriginalPrice && (
                                                    <span className="text-xs font-bold line-through opacity-60">
                                                        {flyerOriginalPrice}
                                                    </span>
                                                )}
                                                {flyerPromoPrice && (
                                                    <span className="text-2xl font-black text-amber-300 drop-shadow">
                                                        {flyerPromoPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* CTA Button Badge */}
                                            <div className="px-3 py-1.5 rounded-lg bg-white text-black font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                                <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                                                Pesan Sekarang
                                            </div>
                                        </div>

                                        {/* Contact Footer Pills */}
                                        <div className="flex items-center justify-between text-[10px] font-bold opacity-90 pt-1">
                                            {flyerWhatsapp && (
                                                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                                                    <Phone className="w-3 h-3 text-green-400" />
                                                    <span>{flyerWhatsapp}</span>
                                                </div>
                                            )}
                                            {flyerInstagram && (
                                                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                                                    <Instagram className="w-3 h-3 text-pink-400" />
                                                    <span>{flyerInstagram}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                Selalu sebutkan **"Sertifikasi Halal"** di bagian awal copywriting dan pasang Badge Halal pada flyer untuk membangun kepercayaan (Trust) instan pada konsumen.
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
                            <h3 className="text-2xl font-black">Flyer Berdampak Tinggi</h3>
                            <p className="text-sm text-rose-100 leading-relaxed font-medium">
                                Gunakan kombinasi foto produk yang jernih, warna kontras, dan headline yang langsung menyebutkan benefit utama produk agar pembeli tertarik saat scroll media sosial.
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
