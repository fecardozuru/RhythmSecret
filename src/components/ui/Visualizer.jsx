// /src/components/ui/Visualizer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart3, 
  Waves, 
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useTheme } from '../../contexts';

/**
 * Visualizador de onda/ritmo em tempo real
 * Mostra o padrão rítmico visualmente com diferentes modos de visualização
 */
const Visualizer = ({
  isPlaying = false,
  bpm = 120,
  volumes = [],
  currentSubdivision = 1,
  currentBeat = 1,
  accentBeats = [1],
  visualizerMode = 'bars', // 'bars', 'wave', 'particles', 'spectrum'
  sensitivity = 0.7,
  onModeChange
}) => {
  const { currentTheme, themeClasses } = useTheme();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [time, setTime] = useState(0);
  const [peak, setPeak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Efeito para animação do visualizador
  useEffect(() => {
    if (!isPlaying || !canvasRef.current) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsAnimating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let frameCount = 0;
    let lastTime = 0;

    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Atualiza o tempo para a animação
      setTime(prev => prev + deltaTime * 0.001);

      // Limpa o canvas
      ctx.clearRect(0, 0, width, height);

      // Desenha baseado no modo
      switch (visualizerMode) {
        case 'bars':
          drawBars(ctx, width, height, frameCount);
          break;
        case 'wave':
          drawWave(ctx, width, height, frameCount);
          break;
        case 'particles':
          drawParticles(ctx, width, height, frameCount);
          break;
        case 'spectrum':
          drawSpectrum(ctx, width, height, frameCount);
          break;
      }

      frameCount++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualizerMode, volumes, bpm, currentSubdivision]);

  // Desenha barras de volume
  const drawBars = (ctx, width, height, frameCount) => {
    const barCount = volumes.length || 16;
    const barWidth = width / barCount;
    const centerY = height / 2;
    const maxHeight = height * 0.8;

    // Gradiente de fundo
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, themeClasses.primary.replace('bg-', '').split('-')[0] + '20');
    gradient.addColorStop(1, themeClasses.accent.replace('bg-', '').split('-')[0] + '10');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Desenha cada barra
    for (let i = 0; i < barCount; i++) {
      const volume = volumes[i] || 0;
      const isCurrent = i === currentSubdivision - 1;
      const isAccent = accentBeats.includes(Math.floor(i / 4) + 1);
      
      // Altura da barra com animação
      const baseHeight = volume * maxHeight * sensitivity;
      const pulse = isCurrent && isPlaying ? 
        Math.sin(frameCount * 0.1) * 10 : 0;
      const barHeight = baseHeight + pulse;

      // Cor da barra
      let color;
      if (isCurrent && isPlaying) {
        color = themeClasses.accent.replace('bg-', '');
      } else if (isAccent) {
        color = themeClasses.primary.replace('bg-', '');
      } else {
        color = themeClasses.highlight.replace('bg-', '');
      }

      // Gradiente na barra
      const barGradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY);
      barGradient.addColorStop(0, color + 'FF');
      barGradient.addColorStop(1, color + '80');

      ctx.fillStyle = barGradient;
      
      // Desenha a barra
      const x = i * barWidth + barWidth * 0.1;
      const barWidthActual = barWidth * 0.8;
      const y = centerY - barHeight / 2;
      
      // Cantos arredondados
      ctx.beginPath();
      ctx.roundRect(x, y, barWidthActual, barHeight, 4);
      ctx.fill();

      // Destaque para batida atual
      if (isCurrent && isPlaying) {
        ctx.shadowColor = color + 'FF';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + barWidthActual / 2 - 2, y - 5, 4, 10);
        ctx.shadowBlur = 0;
      }
    }

    // Linha central
    ctx.strokeStyle = themeClasses.text + '30';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Desenha onda senoidal
  const drawWave = (ctx, width, height, frameCount) => {
    const centerY = height / 2;
    const amplitude = height * 0.4 * sensitivity;
    const frequency = bpm / 120; // Frequência baseada no BPM

    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, themeClasses.primary.replace('bg-', '') + '10');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Desenha a onda
    ctx.beginPath();
    ctx.strokeStyle = themeClasses.accent.replace('bg-', '');
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    for (let x = 0; x < width; x++) {
      // Múltiplas ondas sobrepostas
      const timeOffset = time * frequency;
      const y1 = Math.sin((x / width) * Math.PI * 8 + timeOffset) * amplitude;
      const y2 = Math.sin((x / width) * Math.PI * 16 + timeOffset * 2) * amplitude * 0.5;
      const y3 = Math.sin((x / width) * Math.PI * 32 + timeOffset * 4) * amplitude * 0.25;
      
      const y = centerY + y1 + y2 + y3;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Preenche a área abaixo da onda
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const fillGradient = ctx.createLinearGradient(0, centerY, 0, height);
    fillGradient.addColorStop(0, themeClasses.accent.replace('bg-', '') + '40');
    fillGradient.addColorStop(1, themeClasses.primary.replace('bg-', '') + '10');
    
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Partículas que seguem a onda
    if (isPlaying) {
      for (let i = 0; i < 5; i++) {
        const particleX = (time * 100 + i * 100) % width;
        const particleY = centerY + 
          Math.sin((particleX / width) * Math.PI * 8 + time) * amplitude;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }
  };

  // Desenha partículas (modo simplificado)
  const drawParticles = (ctx, width, height, frameCount) => {
    // Fundo escuro
    ctx.fillStyle = '#00000010';
    ctx.fillRect(0, 0, width, height);

    const particleCount = 50;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const distance = 50 + Math.sin(time * 2 + i) * 30;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const size = 2 + Math.sin(time * 3 + i) * 2;
      const alpha = 0.5 + Math.sin(time * 4 + i) * 0.3;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      
      // Cor baseada na posição
      const hue = (i * 360 / particleCount + time * 50) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
      ctx.fill();

      // Cauda da partícula
      if (isPlaying) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - Math.cos(angle) * 10,
          y - Math.sin(angle) * 10
        );
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };

  // Desenha espectro (modo simplificado)
  const drawSpectrum = (ctx, width, height, frameCount) => {
    const barCount = 32;
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i++) {
      // Altura dinâmica baseada em múltiplas frequências
      const timeOffset = time * (bpm / 60);
      const height1 = Math.sin(i * 0.3 + timeOffset) * height * 0.4;
      const height2 = Math.sin(i * 0.7 + timeOffset * 1.7) * height * 0.3;
      const height3 = Math.sin(i * 1.2 + timeOffset * 2.3) * height * 0.2;
      
      const barHeight = (height1 + height2 + height3) * sensitivity;
      const y = height - barHeight;

      // Gradiente vertical
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      const hue = (i * 360 / barCount) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.8)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(i * barWidth, y, barWidth - 1, barHeight);

      // Destaque no topo
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(i * barWidth, y, barWidth - 1, 2);
    }
  };

  // Modos de visualização disponíveis
  const visualizerModes = [
    { id: 'bars', label: 'Barras', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'wave', label: 'Onda', icon: <Waves className="w-4 h-4" /> },
    { id: 'particles', label: 'Partículas', icon: <Activity className="w-4 h-4" /> },
    { id: 'spectrum', label: 'Espectro', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className={`
      p-6 rounded-2xl
      ${themeClasses.surface}
      ${themeClasses.border}
      backdrop-blur-sm
      transition-all duration-300
    `}>
      {/* Cabeçalho com controles */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            ${themeClasses.primary}
            ${isAnimating ? 'animate-pulse' : ''}
            transition-all duration-300
          `}>
            <Waves className="w-5 h-5" />
          </div>
          
          <div>
            <h2 className="text-lg font-bold">
              Visualizador de Ritmo
            </h2>
            <p className="text-sm opacity-75">
              Representação visual do padrão em tempo real
            </p>
          </div>
        </div>

        {/* Indicador de atividade */}
        <div className={`
          px-3 py-1.5 rounded-full text-xs font-medium
          flex items-center gap-2
          ${isAnimating ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}
          transition-colors duration-300
        `}>
          <Zap className="w-3 h-3" />
          {isAnimating ? 'ATIVO' : 'PAUSADO'}
        </div>
      </div>

      {/* Canvas do visualizador */}
      <div className="mb-6 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-48 rounded-xl bg-black/20"
        />
        
        {/* Overlay informativo */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              px-4 py-3 rounded-xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-md
              text-center
            `}>
              <Waves className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">
                Clique em PLAY para ativar o visualizador
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controles do visualizador */}
      <div className="space-y-4">
        {/* Seletor de modo */}
        <div>
          <label className="block text-sm font-medium mb-2 opacity-75">
            Modo de Visualização
          </label>
          <div className="grid grid-cols-4 gap-2">
            {visualizerModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange && onModeChange(mode.id)}
                className={`
                  flex flex-col items-center justify-center
                  p-3 rounded-lg
                  transition-all duration-200
                  ${visualizerMode === mode.id 
                    ? `${themeClasses.primary} text-white` 
                    : `${themeClasses.surface} hover:${themeClasses.secondary}`
                  }
                  hover:scale-105 active:scale-95
                `}
                title={mode.label}
              >
                {mode.icon}
                <span className="text-xs mt-1">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controle de sensibilidade */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="opacity-75">Sensibilidade</span>
            <span className="font-mono">{Math.round(sensitivity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={sensitivity}
            onChange={(e) => {
              // Aqui você implementaria a mudança de sensibilidade
              // Por enquanto é apenas visual
            }}
            className={`
              w-full h-2 rounded-full appearance-none cursor-pointer
              ${themeClasses.surface}
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:${themeClasses.primary.replace('bg-', 'bg-[')}
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-lg
            `}
          />
        </div>

        {/* Informações em tempo real */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`
            p-3 rounded-lg
            ${themeClasses.secondary}
          `}>
            <div className="text-xs opacity-75 mb-1">BPM</div>
            <div className="text-xl font-bold">{bpm}</div>
          </div>
          
          <div className={`
            p-3 rounded-lg
            ${themeClasses.secondary}
          `}>
            <div className="text-xs opacity-75 mb-1">Subdivisão</div>
            <div className="text-xl font-bold">
              {currentSubdivision}/{volumes.length || 4}
            </div>
          </div>
          
          <div className={`
            p-3 rounded-lg
            ${themeClasses.secondary}
          `}>
            <div className="text-xs opacity-75 mb-1">Pico</div>
            <div className="text-xl font-bold">
              {Math.round(peak * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs opacity-50 text-center">
          O visualizador responde ao volume, BPM e padrão rítmico em tempo real
        </p>
      </div>
    </div>
  );
};

// Adiciona método roundRect ao CanvasRenderingContext2D se não existir
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
}

// Propriedades padrão
Visualizer.defaultProps = {
  isPlaying: false,
  bpm: 120,
  volumes: [0.8, 0.4, 0.6, 0.3, 0.7, 0.5, 0.4, 0.6],
  currentSubdivision: 1,
  currentBeat: 1,
  accentBeats: [1],
  visualizerMode: 'bars',
  sensitivity: 0.7
};

export default Visualizer;
