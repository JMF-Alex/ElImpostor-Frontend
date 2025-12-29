import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Room } from '../pages/RoomPage';
import { Target, Loader2 } from 'lucide-react';

interface VotingProps {
  room: Room;
  socket: Socket;
}

const Voting: React.FC<VotingProps> = ({ room, socket }) => {
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [isTie, setIsTie] = useState(false);

  React.useEffect(() => {
    socket.on('vote_tie', () => {
      setIsTie(true);
      setVotedFor(null);
      setTimeout(() => setIsTie(false), 3000);
    });

    return () => {
      socket.off('vote_tie');
    };
  }, [socket]);

  const castVote = (targetId: string) => {
    const newVote = votedFor === targetId ? null : targetId;
    setVotedFor(newVote);
    socket.emit('cast_vote', { roomId: room.id, targetId: newVote });
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-12">
        <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] whitespace-nowrap">CONSEJO DE EXPULSIÓN</h2>
        <div className="h-px grow bg-white/10" />
        {isTie && (
          <div className="px-4 py-1.5 bg-accent-red text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-bounce realistic-shadow ring-4 ring-accent-red/20 ml-4">
            ¡EMPATE! VOTAD DE NUEVO
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {room.players.map((p) => {
          const isMe = p.id === socket.id;
          const isSelected = votedFor === p.id;
          
          return (
            <button
              key={p.id}
              className={`group flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden
                ${isSelected 
                  ? 'bg-accent-red/20 border-accent-red glow-red transform scale-105 z-10' 
                  : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                }
                ${votedFor && !isSelected ? 'opacity-30 blur-[1px] hover:opacity-50 hover:blur-0' : 'opacity-100'}
              `}
              onClick={() => castVote(p.id)}
            >
              <div className="absolute top-4 right-4 text-accent-red transition-all duration-500" style={{ opacity: isSelected ? 1 : 0, transform: isSelected ? 'scale(1)' : 'scale(0.5)' }}>
                  <Target size={20} className="animate-pulse" />
              </div>

              <div className={`w-16 h-16 rounded-full mb-6 flex items-center justify-center font-black text-2xl transition-all duration-500 border-2
                ${isSelected ? 'bg-accent-red border-white/20 text-white' : 'bg-white/10 border-white/5 text-text-secondary group-hover:scale-110 group-hover:text-white'}
              `}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              
              <span className="font-bold tracking-tight text-lg mb-1">{p.name}</span>
              {isMe && <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">Tu mismo</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-16 h-12 flex items-center justify-center">
        {votedFor ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="px-6 py-3 bg-accent-red/10 border border-accent-red/20 rounded-full flex items-center gap-3">
              <Loader2 className="animate-spin text-accent-red" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-red">VOTO REGISTRADO • PUEDES CAMBIARLO</span>
            </div>
            <p className="text-[9px] text-text-secondary font-medium">Haz click en otro para cambiar o en el mismo para retirar</p>
          </div>
        ) : (
          <p className="text-[10px] font-black tracking-widest text-text-secondary uppercase opacity-40 italic">Esperando tu voto...</p>
        )}
      </div>
    </div>
  );
};

export default Voting;
