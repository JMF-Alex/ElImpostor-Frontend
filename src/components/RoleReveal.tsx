import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Room } from '../pages/RoomPage';
import Voting from './Voting';
import { Eye, EyeOff, AlertTriangle, CheckCircle2, RotateCcw, Mic } from 'lucide-react';

interface RoleRevealProps {
  room: Room;
  socket: Socket;
  result: { winner: string; word: string; impostor: string; ejectedName?: string } | null;
}

const RoleReveal: React.FC<RoleRevealProps> = ({ room, socket, result }) => {
  const [showWord, setShowWord] = useState(false);
  const me = room.players.find((p) => p.id === socket.id);
  const isImpostor = me?.role === 'impostor';

  if (result && room.gameState === 'ended') {
    const isFriendsWinner = result.winner === 'friends';
    const hasWon = (isFriendsWinner && !isImpostor) || (!isFriendsWinner && isImpostor);
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 animate-in fade-in duration-1000 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${hasWon ? 'bg-green-500/10' : 'bg-red-500/10'}`} />
        
        <div className={`glass-card p-12 w-full max-w-2xl text-center realistic-shadow border-t-8 relative z-10 ${hasWon ? 'border-green-500 glow-blue' : 'border-accent-red glow-red'}`}>
          <div className="flex justify-center mb-8 relative">
            {hasWon ? (
              <div className="relative">
                <CheckCircle2 size={80} className="text-green-500 animate-in zoom-in duration-500" />
                <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
              </div>
            ) : (
              <div className="relative">
                <AlertTriangle size={80} className="text-accent-red animate-bounce" />
                <div className="absolute inset-0 bg-accent-red/20 blur-2xl rounded-full" />
              </div>
            )}
          </div>
          
          <h1 className={`text-6xl font-black mb-2 tracking-tighter uppercase ${hasWon ? 'text-white' : 'text-accent-red'}`}>
            {hasWon ? 'HAS GANADO' : 'HAS PERDIDO'}
          </h1>
          <p className="text-text-secondary font-black tracking-[0.3em] mb-12 uppercase text-[10px] opacity-80">
            {hasWon ? 'Has encontrado al impostor' : 'Has sido identificado como impostor'}
          </p>

          <div className="mb-10 text-left">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-text-secondary uppercase mb-6 px-2">PUNTUACIONES</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {room.players.map(p => {
                const pIsImpostor = p.id === room.impostorId;
                const pWon = (isFriendsWinner && !pIsImpostor) || (!isFriendsWinner && pIsImpostor);
                const points = pIsImpostor ? 3 : 1;

                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${pIsImpostor ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' : 'bg-white/10 text-white'}`}>
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className={`font-bold text-sm ${pIsImpostor ? 'text-accent-red' : 'text-white'}`}>{p.name} {pIsImpostor && '(IMPOSTOR)'}</span>
                    </div>
                    {pWon && (
                      <span className="text-xs font-black text-green-500 animate-pulse">+{points} PTS</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <button 
              className="btn-premium w-full flex items-center justify-center gap-3 py-5" 
              onClick={() => socket.emit('back_to_lobby')}
            >
              <RotateCcw size={20} /> REGRESAR AL LOBBY
            </button>
            <button 
              className="w-full text-text-secondary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2" 
              onClick={() => window.location.href = '/'}
            >
              SALIR AL MENÚ PRINCIPAL
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[120px] transition-opacity duration-1000 ${showWord && !isImpostor ? 'opacity-100' : 'opacity-40'}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-accent-red/10 rounded-full blur-[120px] transition-opacity duration-1000 ${showWord && isImpostor ? 'opacity-100' : 'opacity-40'}`} />
      </div>

      {!showWord ? (
        <div className="w-full max-w-4xl px-6 animate-in fade-in zoom-in duration-700">
          <div className="glass-card p-12 md:p-20 text-center realistic-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="scanline opacity-20" />
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-text-secondary mb-12 animate-pulse">TRANSMISIÓN ENTRANTE...</h2>
            <h1 className="text-4xl md:text-7xl font-black mb-16 tracking-tighter leading-tight uppercase relative z-10">
              EL ALGORITMO HA <br/>DECIDIDO
            </h1>
            
            <div className="relative inline-block group/btn">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-0 group-hover/btn:scale-110 transition-transform duration-500" />
              <button 
                className="btn-premium px-16 py-7 flex items-center gap-5 mx-auto relative z-20"
                onClick={() => setShowWord(true)}
              >
                <Eye size={24} className="group-hover:rotate-12 transition-transform" /> 
                <span className="tracking-widest">DESBLOQUEAR</span>
              </button>
            </div>

            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-blue/5 rounded-full blur-[80px] group-hover:bg-accent-blue/10 transition-colors duration-1000" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-red/5 rounded-full blur-[80px] group-hover:bg-accent-red/10 transition-colors duration-1000" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl px-4 py-12 animate-in fade-in slide-in-from-bottom-20 duration-1000 ease-out custom-scrollbar overflow-y-auto max-h-screen">
          <div className="space-y-12 pb-12">
            <div className={`glass-card p-12 md:p-16 text-center border-white/5 realistic-shadow relative overflow-hidden group transition-all duration-700 ${isImpostor ? 'glow-red border-accent-red/20' : 'glow-blue border-accent-blue/20'}`}>
              
               {isImpostor && (
                 <>
                   <div className="absolute inset-0 bg-red-950/20 -z-10" />
                   <div className="absolute inset-0 tron-grid animate-tron -z-10 opacity-40 scale-150 origin-center" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black -z-10" />
                   <div className="absolute top-0 left-0 w-full h-1 bg-accent-red glow-red shadow-[0_0_20px_#ff3e3e] z-10" />
                   <div className="absolute bottom-0 left-0 w-full h-1 bg-accent-red glow-red shadow-[0_0_20px_#ff3e3e] z-10" />
                 </>
               )}
               
               {!isImpostor && (
                 <div className="absolute inset-0 bg-accent-blue/5 -z-10" />
               )}
               
               <div className="scanline" />

               <button 
                onClick={() => setShowWord(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 text-text-secondary hover:text-white transition-all hover:scale-110 z-20 backdrop-blur-md"
               >
                 <EyeOff size={18} />
               </button>

              <div className="flex items-center justify-center gap-4 mb-10 opacity-60">
                <div className="h-px w-8 bg-white/20" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary italic">ASIGNACIÓN DE ROL</h2>
                <div className="h-px w-8 bg-white/20" />
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 lg:gap-12 items-center justify-center mb-4 relative z-10 px-2">
                  <>
                    <div className="text-center md:text-left px-8 py-6 bg-black/40 border border-white/10 rounded-[32px] w-full md:w-auto realistic-shadow backdrop-blur-md transition-transform hover:scale-105 duration-500">
                      <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] block mb-2 opacity-70">{isImpostor ? 'CATEGORÍA' : 'ROL'}</span>
                      <span className={`text-2xl md:text-3xl font-black tracking-tight uppercase animate-text-reveal ${isImpostor ? 'text-white' : 'text-accent-blue'}`}>
                        {isImpostor ? room.category : 'AMIGO'}
                      </span>
                    </div>
                    <div className="hidden md:block w-[2px] h-12 bg-white/10 rotate-12" />
                  </>

                <div className="text-center md:text-left px-12 py-8 bg-black/40 border border-white/10 rounded-[32px] w-full md:w-auto realistic-shadow backdrop-blur-md transition-transform hover:scale-105 duration-500 ring-1 ring-white/5">
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] block mb-2 opacity-70">{isImpostor ? 'IDENTIDAD' : 'PALABRA'}</span>
                  <h3 
                    className={`text-5xl md:text-7xl font-black tracking-tighter uppercase animate-text-reveal`}
                    style={{
                      textShadow: isImpostor 
                        ? '0 0 25px rgba(255,62,62,0.6), 0 0 50px rgba(255,62,62,0.3)' 
                        : '0 0 25px rgba(62,146,255,0.6), 0 0 50px rgba(62,146,255,0.3)',
                      color: isImpostor ? '#ff3e3e' : '#3e92ff'
                    }}
                  >
                    {isImpostor ? 'IMPOSTOR' : room.secretWord}
                  </h3>
                </div>
              </div>

              {room.startingPlayerId && (
                <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700 delay-500">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl realistic-shadow">
                    <Mic size={16} className="text-accent-blue animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase">
                      EMPIEZA HABLANDO: <span className="text-white">{room.players.find(p => p.id === room.startingPlayerId)?.name}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Voting room={room} socket={socket} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleReveal;
