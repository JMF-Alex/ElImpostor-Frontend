import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Share2, Play, Loader2, CornerDownLeft } from 'lucide-react';
import RoleReveal from '../components/RoleReveal';

export interface Player {
  id: string;
  name: string;
  role: 'impostor' | 'friend' | null;
  isAlive: boolean;
  status: 'lobby' | 'playing';
}

export interface Room {
  id: string;
  players: Player[];
  gameState: 'lobby' | 'playing' | 'ended';
  secretWord: string | null;
  category: string | null;
  impostorId: string | null;
  scores: Record<string, number>;
}

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const socket: Socket = io(apiUrl, {
  transports: ['polling', 'websocket'],
  withCredentials: true
});

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [gameResult, setGameResult] = useState<{ winner: string; word: string; impostor: string; ejectedName?: string } | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  useEffect(() => {
    socket.on('room_update', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('game_started', (startedRoom: Room) => {
      setRoom(startedRoom);
      setGameResult(null);
    });

    socket.on('game_ended', (result) => {
      setGameResult(result);
    });

    return () => {
      if (room?.id) {
        socket.emit('leave_room', room.id);
      }
      socket.off('room_update');
      socket.off('game_started');
      socket.off('game_ended');
    };
  }, [room?.id]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId) {
      socket.emit('join_room', { roomId, playerName });
      setIsJoined(true);
    }
  };

  const handleStartGame = () => {
    if (room && roomId) {
      socket.emit('start_game', roomId);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass-card p-10 w-full max-w-md realistic-shadow border-white/5">
          <h2 className="text-3xl font-black mb-2 tracking-tight uppercase">UNIRSE A SALA</h2>
          <p className="text-text-secondary mb-8 text-sm font-medium italic">Accediendo a la frecuencia: <span className="text-white font-bold">{roomId}</span></p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">IDENTIFICACIÓN DE USUARIO</label>
              <input 
                autoFocus
                type="text" 
                className="input-premium" 
                placeholder="Nombre clave..." 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
            </div>
            <button type="submit" className="btn-premium w-full flex items-center justify-center gap-2">
              CONECTAR AL SERVIDOR <Play size={18} fill="currentColor" />
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="w-full text-text-secondary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-white opacity-20" size={48} strokeWidth={1} />
        <p className="text-text-secondary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Sincronizando con la red...</p>
      </div>
    );
  }

  const me = room.players.find(p => p.id === socket.id);

  if (room.gameState === 'playing' || (room.gameState === 'ended' && me?.status !== 'lobby')) {
    return <RoleReveal room={room} socket={socket} result={gameResult} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-accent-blue animate-pulse">EN ESPERA</span>
              <span className="text-text-secondary text-[10px] font-black uppercase tracking-widest">SALA: {room.id}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">EQUIPANDO <br/>MISIONES</h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={copyLink}
              className="btn-glass flex items-center gap-3 text-xs font-bold tracking-widest uppercase border-white/5"
            >
              <Share2 size={16} /> 
              {showCopyFeedback ? '¡COPIADO!' : 'INVITAR'}
            </button>
            <button 
              onClick={() => {
                if (roomId) socket.emit('leave_room', roomId);
                navigate('/');
              }}
              className="btn-glass flex items-center gap-3 text-xs font-bold tracking-widest uppercase border-accent-red/20 text-accent-red hover:bg-accent-red/10"
            >
              <CornerDownLeft size={16} />
              SALIR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.4em] text-text-secondary uppercase mb-6">PERSONAL EN SALA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.players.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl transition-all hover:bg-white/[0.05] group">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 font-black text-sm group-hover:bg-white/10 transition-colors">
                        {p.name[0].toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-black rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight text-white">{p.name}</span>
                      <span className="text-[9px] font-black text-text-secondary tracking-widest uppercase">Score: {(room.scores && room.scores[p.id]) || 0}</span>
                    </div>
                  </div>
                  {p.id === socket.id && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-accent-blue/20 text-accent-blue px-3 py-1.5 rounded-full border border-accent-blue/30 realistic-shadow">TÚ</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-10 flex flex-col justify-between realistic-shadow h-full border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6 tracking-tight uppercase">PARTIDA</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-12 font-medium">
                La partida requiere un mínimo de <span className="text-white font-bold underline underline-offset-4">3 participantes</span>.
              </p>
            </div>

            {room.players.length >= 3 ? (
              <button 
                onClick={handleStartGame}
                className="btn-premium w-full flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">INICIAR</span>
                <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            ) : (
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">BLOQUEADO</p>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-accent-blue transition-all duration-700" 
                    style={{ width: `${(room.players.length / 3) * 100}%` }}
                   />
                </div>
                <p className="text-[9px] font-black uppercase text-text-secondary mt-3 italic">Faltan {3 - room.players.length} participantes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
