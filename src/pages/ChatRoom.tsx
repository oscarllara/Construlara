"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NicknameDialog from '@/components/NicknameDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Image, Video, Phone, X, 
  MoreVertical, Smile, Lock, 
  ArrowLeft, Camera, User
} from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  type: 'public' | 'private';
  recipient?: string;
  media?: 'photo' | 'video';
}

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState<string | null>(null);
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateRecipient, setPrivateRecipient] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const users = ["Ana_22", "Carlos_PR", "Beto_Dev", "Clara_Luz", "Gamer_X"];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleJoin = (name: string) => {
    setNickname(name);
    setIsNicknameDialogOpen(false);
    toast.success(`Bem-vindo, ${name}!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !nickname) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: nickname,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: privateRecipient ? 'private' : 'public',
      recipient: privateRecipient || undefined,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleMediaUpload = (type: 'photo' | 'video') => {
    toast.info(`Funcionalidade de envio de ${type} em desenvolvimento.`);
  };

  const startVideoCall = () => {
    toast.success("Iniciando chamada de vídeo...");
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <NicknameDialog open={isNicknameDialogOpen} onConfirm={handleJoin} />

      {/* Sidebar - Users */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col h-full">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">{id}</h2>
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Online Agora</p>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Participantes</p>
            {users.map(u => (
              <button 
                key={u}
                onClick={() => setPrivateRecipient(u)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-2xl transition-all group hover:bg-slate-50",
                  privateRecipient === u && "bg-purple-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-purple-600" />
                  </div>
                  <span className="font-bold text-slate-700">{u}</span>
                </div>
                {privateRecipient === u && <Lock className="h-3 w-3 text-purple-600" />}
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black">
              {nickname?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{nickname || 'Visitante'}</p>
              <p className="text-[10px] font-bold text-slate-400">Conectado</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Conversa Geral</h3>
              {privateRecipient && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="bg-purple-600 text-white border-none text-[9px] font-black uppercase">Privado com {privateRecipient}</Badge>
                  <button onClick={() => setPrivateRecipient(null)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={startVideoCall}><Video className="h-5 w-5 text-slate-600" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl"><Phone className="h-5 w-5 text-slate-600" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-5 w-5 text-slate-600" /></Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                  <MessageCircle className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">Nenhuma mensagem ainda. Comece o papo!</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col", msg.sender === nickname ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender}</span>
                  {msg.type === 'private' && <Badge className="bg-purple-50 text-purple-700 border-none text-[8px] font-black uppercase">Privado</Badge>}
                </div>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl shadow-sm text-sm font-medium",
                  msg.sender === nickname 
                    ? "bg-purple-600 text-white rounded-tr-none" 
                    : msg.type === 'private' 
                    ? "bg-purple-50 text-purple-900 border border-purple-100 rounded-tl-none"
                    : "bg-slate-100 text-slate-900 rounded-tl-none"
                )}>
                  {msg.text}
                  <div className={cn("text-[9px] mt-1 text-right font-black uppercase opacity-60", msg.sender === nickname ? "text-white" : "text-slate-400")}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="p-8 border-t border-slate-100 bg-white">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative bg-slate-50 rounded-[2.5rem] p-2 flex items-center gap-2 border border-slate-100 focus-within:border-purple-200 focus-within:ring-4 focus-within:ring-purple-50 transition-all">
              <div className="flex items-center px-2">
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-white" onClick={() => handleMediaUpload('photo')}><Image className="h-5 w-5 text-slate-400" /></Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-white" onClick={() => handleMediaUpload('video')}><Video className="h-5 w-5 text-slate-400" /></Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-white"><Smile className="h-5 w-5 text-slate-400" /></Button>
              </div>
              <Input 
                placeholder={privateRecipient ? `Mensagem privada para ${privateRecipient}...` : "Digite sua mensagem..."} 
                className="bg-transparent border-none h-12 text-base font-bold focus-visible:ring-0 placeholder:text-slate-300" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" disabled={!message.trim()} className="bg-purple-600 hover:bg-purple-700 text-white h-12 w-12 rounded-full shadow-lg shadow-purple-100 shrink-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {privateRecipient && (
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-3 text-center flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Sua mensagem será visível apenas para {privateRecipient}
              </p>
            )}
          </form>
        </footer>
      </main>
    </div>
  );
};

export default ChatRoom;