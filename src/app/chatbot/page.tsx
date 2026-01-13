"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, Sparkles, Zap, Trash2, BrainCircuit, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
    role: "bot" | "user";
    content: string;
    time: string;
};

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "bot",
            content: "Assalamualaikum Warahmatullah Wabarakatuh! Saya UNI, asisten AI khusus LPH UNISMA. Saya dibekali dengan pengetahuan mendalam mengenai regulasi BPJPH 2024, prosedur sertifikasi halal, dan standar audit. Apa yang ingin Anda diskusikan hari ini?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const botMsg: Message = {
                role: "bot",
                content: data.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMsg: Message = {
                role: "bot",
                content: "Maaf, sepertinya UNI sedang sibuk atau ada masalah koneksi. Pastikan API Key Gemini sudah terpasang di .env.local.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight text-primary flex items-center gap-3">
                        <Bot className="w-10 h-10 text-secondary" />
                        Chat <span className="text-secondary">UNI</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Asisten cerdas berbasis Large Language Model untuk solusi Halal Anda.</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => setMessages([messages[0]])} className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 transition-all">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                <Card className="flex-1 flex flex-col shadow-2xl border-none overflow-hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-[2.5rem] relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary z-20" />
                    <CardHeader className="bg-primary/5 p-6 flex flex-row items-center justify-between shrink-0 border-b border-primary/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-primary/20">
                                    <img src="/lph-logo.png" alt="LPH Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-primary">UNI Agent v2.4</CardTitle>
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3 text-secondary" />
                                    Knowledge Hub Active
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest">
                                High Accuracy
                            </div>
                        </div>
                    </CardHeader>

                    <div className="flex-1 p-6 overflow-y-auto scroll-smooth" ref={scrollRef}>
                        <div className="space-y-8 max-w-4xl mx-auto min-h-full">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn("flex gap-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg overflow-hidden",
                                        msg.role === "user" ? "bg-secondary text-white" : "bg-white border-2 border-primary/10"
                                    )}>
                                        {msg.role === "user" ? (
                                            <Zap className="w-5 h-5" />
                                        ) : (
                                            <img src="/uni-avatar.png" alt="UNI" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className={cn("flex flex-col gap-2 max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm border",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none border-primary/10 font-medium"
                                                : "bg-white dark:bg-muted border-primary/5 rounded-tl-none text-foreground"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tight opacity-60 px-2">{msg.role} • {msg.time}</span>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4 animate-in fade-in duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-primary/10 flex items-center justify-center text-primary overflow-hidden">
                                        <img src="/uni-avatar.png" alt="UNI" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-3xl rounded-tl-none border border-primary/5 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <CardFooter className="p-6 bg-primary/5 border-t border-primary/5 flex gap-3 shrink-0">
                        <div className="flex-1 relative">
                            <Input
                                placeholder="Tanyakan apa saja tentang sertifikasi halal..."
                                className="h-16 border-2 border-primary/10 focus-visible:ring-primary focus-visible:border-primary rounded-2xl px-6 text-lg bg-white/50 backdrop-blur-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">↵</span> Enter
                                </kbd>
                            </div>
                        </div>
                        <Button onClick={handleSend} className="h-16 w-16 rounded-2xl bg-primary hover:bg-primary/95 shadow-xl shadow-primary/20 group">
                            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* AI Insights Sidebar */}
                <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0">
                    <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-[2rem] overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2 relative z-10">
                            <Sparkles className="w-5 h-5 text-secondary" />
                            AI Insights
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs leading-relaxed">
                                <span className="font-black text-secondary uppercase block mb-1">Update Regulasi</span>
                                BPJPH menerapkan Mandatory Halal Oktober 2024 untuk produk makanan & minuman.
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs leading-relaxed">
                                <span className="font-black text-secondary uppercase block mb-1">Tips LPH</span>
                                Memilih LPH UNISMA dapat mempercepat proses audit karena integrasi sistem satu pintu.
                            </div>
                        </div>
                    </Card>

                    <Card className="flex-1 p-8 flex flex-col items-center justify-center border-dashed border-2 text-center gap-6 bg-muted/20 rounded-[2rem]">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-primary">Data Aman</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed px-2">
                                Semua percakapan Anda dienkripsi dan digunakan hanya untuk meningkatkan kualitas asisten UNI.
                            </p>
                        </div>
                        <Button variant="link" className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Kebijakan Privasi
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
