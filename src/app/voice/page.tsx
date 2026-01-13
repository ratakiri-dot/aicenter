"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, Activity, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VoicePage() {
    const [isCalling, setIsCalling] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [status, setStatus] = useState("Siap Terhubung");
    const [transcript, setTranscript] = useState("");

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'id-ID';

                recognitionRef.current.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const resultTranscript = event.results[current][0].transcript;
                    setTranscript(resultTranscript);
                    setStatus("UNI sedang mendengarkan...");
                };
            }
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    useEffect(() => {
        let interval: any;
        if (isCalling) {
            interval = setInterval(() => {
                setTimer((t) => t + 1);
            }, 1000);

            if (recognitionRef.current && !isMuted) {
                try {
                    recognitionRef.current.start();
                } catch (e) { }
            }

            // Initial UNI greeting
            speak("Halo, saya UNI. Ada yang bisa saya bantu mengenai sertifikasi halal hari ini?");

        } else {
            setTimer(0);
            clearInterval(interval);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setTranscript("");
            setStatus("Siap Terhubung");
        }
        return () => clearInterval(interval);
    }, [isCalling]);

    const silentTimerRef = useRef<any>(null);

    const speak = (text: string) => {
        if (synthRef.current) {
            // Stop any current speaking
            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.pitch = 1.1;
            utterance.rate = 1;

            utterance.onstart = () => {
                setStatus("UNI sedang berbicara...");
            };

            utterance.onend = () => {
                setStatus("UNI sedang mendengarkan...");
            };

            synthRef.current.speak(utterance);
        }
    };

    const handleAIVoiceProcess = async (text: string) => {
        if (!text.trim()) return;

        setStatus("UNI sedang memikirkan jawaban...");
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "user", content: text }
                    ]
                }),
            });
            const data = await res.json();
            if (data.text) {
                speak(data.text);
            }
        } catch (error) {
            console.error("Voice AI Error:", error);
            setStatus("Koneksi terputus...");
        }
    };

    useEffect(() => {
        if (transcript && isCalling && !isMuted) {
            if (silentTimerRef.current) clearTimeout(silentTimerRef.current);

            silentTimerRef.current = setTimeout(() => {
                handleAIVoiceProcess(transcript);
            }, 1800); // 1.8s silence detection
        }
    }, [transcript]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full transition-all duration-1000",
                    isCalling ? "opacity-100 scale-110" : "opacity-0 scale-50"
                )} />
            </div>

            <div className="flex flex-col items-center text-center gap-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black uppercase tracking-widest">
                    <BrainCircuit className="w-4 h-4" />
                    AI Real-time Voice
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-primary">
                    UNI <span className="text-secondary">Voice</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg font-medium">
                    Konsultasi interaktif melalui suara. UNI dapat memahami pertanyaan Anda dan memberikan jawaban langsung.
                </p>
            </div>

            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                {/* Visualizer Rings */}
                {isCalling && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="absolute border-2 border-primary/20 rounded-full animate-ping"
                                style={{
                                    width: `${100 + i * 50}%`,
                                    height: `${100 + i * 50}%`,
                                    animationDuration: `${2 + i}s`,
                                    animationDelay: `${i * 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Main Interface Card */}
                <Card className={cn(
                    "w-72 h-72 rounded-[3rem] border-4 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.1)] transition-all duration-700 overflow-hidden relative group bg-white dark:bg-card",
                    isCalling ? "border-secondary scale-110 shadow-secondary/20" : "border-primary/10"
                )}>
                    {isCalling && (
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent animate-shimmer" />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                        </div>
                    )}

                    <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 mb-4",
                        isCalling ? "bg-secondary text-white shadow-xl shadow-secondary/40" : "bg-primary/5 text-primary"
                    )}>
                        <Activity className={cn("w-12 h-12", isCalling && "animate-pulse")} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {isCalling ? (
                            <>
                                <span className="text-primary font-black text-2xl tracking-tight">{formatTime(timer)}</span>
                                <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mt-2 animate-pulse">{status}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em]">Standby Mode</span>
                        )}
                    </div>
                </Card>
            </div>

            {/* Transcription Display */}
            <div className={cn(
                "w-full max-w-2xl px-8 py-6 rounded-3xl bg-muted/30 border border-primary/10 backdrop-blur-md transition-all duration-500 min-h-[100px] flex items-center justify-center text-center",
                isCalling ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}>
                <p className="text-lg font-medium text-primary/80 italic">
                    {transcript || "Silakan bicara, UNI siap membantu..."}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 relative z-20 scale-125">
                {!isCalling ? (
                    <Button
                        onClick={() => setIsCalling(true)}
                        className="w-24 h-24 rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 group transition-all hover:scale-110 active:scale-95"
                    >
                        <Phone className="w-10 h-10 group-hover:animate-bounce" />
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsMuted(!isMuted)}
                            className={cn(
                                "w-16 h-16 rounded-full border-2 transition-all",
                                isMuted ? "bg-destructive text-white border-destructive" : "hover:border-primary/40"
                            )}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        <Button
                            onClick={() => setIsCalling(false)}
                            className="w-24 h-24 rounded-full bg-destructive hover:bg-destructive/90 shadow-2xl shadow-destructive/40 ring-4 ring-white dark:ring-card transition-all hover:scale-110 active:scale-95"
                        >
                            <PhoneOff className="w-10 h-10 rotate-[135deg]" />
                        </Button>

                        <Button
                            variant="outline"
                            className="w-16 h-16 rounded-full border-2 hover:border-gold/40"
                        >
                            <Volume2 className="w-6 h-6" />
                        </Button>
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
