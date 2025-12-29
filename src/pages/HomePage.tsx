import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Fingerprint } from 'lucide-react';

const HomePage: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = roomName.toLowerCase().trim().replace(/\s+/g, '-') || Math.random().toString(36).substring(7);
    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* bg decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-red/5 blur-[120px] rounded-full"></div>

      <div className="z-10 text-center max-w-2xl w-full">
        <div className="mb-12 flex justify-center">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 realistic-shadow">
            <Fingerprint size={64} className="text-white" strokeWidth={1} />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          EL <span className="text-accent-red">IMPOSTOR</span>
        </h1>
        
        <p className="text-text-secondary text-lg md:text-xl mb-12 max-w-lg mx-auto font-medium">
          Un juego de decepción, estrategia y supervivencia en tiempo real.
        </p>

        <form onSubmit={handleCreateRoom} className="glass-card p-2 flex flex-col md:flex-row gap-2 max-w-md mx-auto realistic-shadow">
          <input 
            type="text" 
            placeholder="Nombre de la sala..." 
            className="flex-1 bg-transparent px-6 py-4 text-white outline-none font-medium"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button type="submit" className="btn-premium flex items-center justify-center gap-2">
            CREAR SALA <Play size={18} fill="currentColor" />
          </button>
        </form>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <Shield size={20} className="text-accent-blue" />
            </div>
            <h3 className="text-lg font-bold">Privado</h3>
            <p className="text-text-secondary text-sm">Crea salas privadas y comparte el enlace con tus amigos.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <Play size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold">Instantáneo</h3>
            <p className="text-text-secondary text-sm">Sin registros, sin esperas. Entra y juega inmediatamente.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
              <Fingerprint size={20} className="text-accent-red" />
            </div>
            <h3 className="text-lg font-bold">Realista</h3>
            <p className="text-text-secondary text-sm">Interfaz diseñada para una inmersión total en el juego.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
