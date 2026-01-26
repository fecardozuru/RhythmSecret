// /src/components/ui/SubdivisionSelector.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  Music, 
  Divide,
  Sigma,
  BarChart3,
  Layers,
  GripVertical,
  Zap,
  Target,
  Grid3x3
} from 'lucide-react';

/**
 * SubdivisionSelector - Selecionador avançado de subdivisões rítmicas
 * Implementa tercinas de forma musicalmente correta
 */

// Definição musical correta das subdivisões
const SUBDIVISION_DEFINITIONS = {
  // Subdivisões binárias (padrão ocidental)
  BINARY: [
    { 
      value: 1, 
      label: 'Semínima', 
      description: '1 nota por tempo',
      symbol: '♩',
      type: 'BINARY',
      duration: 1,
      ratio: '1:1',
      color: 'bg-blue-500',
      icon: Music
    },
    { 
      value: 2, 
      label: 'Colcheias', 
      description: '2 notas por tempo',
      symbol: '♪',
      type: 'BINARY',
      duration: 0.5,
      ratio: '2:1',
      color: 'bg-green-500',
      icon: Divide
    },
    { 
      value: 4, 
      label: 'Semicolcheias', 
      description: '4 notas por tempo',
      symbol: '♬',
      type: 'BINARY',
      duration: 0.25,
      ratio: '4:1',
      color: 'bg-purple-500',
      icon: BarChart3
    },
    { 
      value: 8, 
      label: 'Fusas', 
      description: '8 notas por tempo',
      symbol: '𝅘𝅥𝅰',
      type: 'BINARY',
      duration: 0.125,
      ratio: '8:1',
      color: 'bg-pink-500',
      icon: Layers
    }
  ],
  
  // Tercinas (subdivisões ternárias)
  TRIPLET: [
    { 
      value: 3, 
      label: 'Tercina de Semínima', 
      description: '3 notas no tempo de 1 semínima',
      symbol: '3',
      type: 'TRIPLET',
      duration: 0.666, // 2/3 de uma semínima
      ratio: '3:2',
      color: 'bg-amber-500',
      icon: GripVertical,
      tupletRatio: 3/2
    },
    { 
      value: 6, 
      label: 'Tercina de Colcheia', 
      description: '6 notas no tempo de 1 semínima',
      symbol: '6',
      type: 'TRIPLET',
      duration: 0.333, // 1/3 de uma semínima
      ratio: '6:4',
      color: 'bg-orange-500',
      icon: Grid3x3,
      tupletRatio: 3/2
    },
    { 
      value: 12, 
      label: 'Tercina de Semicolcheia', 
      description: '12 notas no tempo de 1 semínima',
      symbol: '12',
      type: 'TRIPLET',
      duration: 0.166, // 1/6 de uma semínima
      ratio: '12:8',
      color: 'bg-red-500',
      icon: Sigma,
      tupletRatio: 3/2
    }
  ],
  
  // Subdivisões irregulares (quintupletos, septupletos, etc.)
  IRREGULAR: [
    { 
      value: 5, 
      label: 'Quintina', 
      description: '5 notas no tempo de 4',
      symbol: '5',
      type: 'IRREGULAR',
      duration: 0.8,
      ratio: '5:4',
      color: 'bg-indigo-500',
      icon: Zap,
      tupletRatio: 5/4
    },
    { 
      value: 7, 
      label: 'Septina', 
      description: '7 notas no tempo de 4',
      symbol: '7',
      type: 'IRREGULAR',
      duration: 0.571,
      ratio: '7:4',
      color: 'bg-violet-500',
      icon: Sigma,
      tupletRatio: 7/4
    },
    { 
      value: 9, 
      label: 'Nonina', 
      description: '9 notas no tempo de 8',
      symbol: '9',
      type: 'IRREGULAR',
      duration: 0.888,
      ratio: '9:8',
      color: 'bg-teal-500',
      icon: Target,
      tupletRatio: 9/8
    }
  ]
};

// Tipos de display para o dropdown
const DISPLAY_MODES = {
  ALL: 'Todas as Subdivisões',
  BINARY_ONLY: 'Apenas Binárias',
  TUPLETS_ONLY: 'Apenas Tercinas',
  IRREGULAR_ONLY: 'Apenas Irregulares'
};

const SubdivisionSelector = ({
  currentSubdivision = 4,
  onSubdivisionChange,
  displayMode = 'ALL',
  showAdvanced = true,
  theme = 'default',
  compact = false,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Filtra subdivisões baseado no modo de display
  const availableSubdivisions = useMemo(() => {
    let filtered = [];
    
    switch (displayMode) {
      case 'BINARY_ONLY':
        filtered = SUBDIVISION_DEFINITIONS.BINARY;
        break;
      case 'TUPLETS_ONLY':
        filtered = SUBDIVISION_DEFINITIONS.TRIPLET;
        break;
      case 'IRREGULAR_ONLY':
        filtered = SUBDIVISION_DEFINITIONS.IRREGULAR;
        break;
      case 'ALL':
      default:
        filtered = [
          ...SUBDIVISION_DEFINITIONS.BINARY,
          ...SUBDIVISION_DEFINITIONS.TRIPLET,
          ...SUBDIVISION_DEFINITIONS.IRREGULAR
        ];
        break;
    }
    
    // Filtra por busca se houver
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return filtered.filter(sub => 
        sub.label.toLowerCase().includes(query) ||
        sub.description.toLowerCase().includes(query) ||
        sub.symbol.includes(query) ||
        sub.value.toString().includes(query)
      );
    }
    
    // Filtra por categoria ativa
    if (activeCategory !== 'ALL') {
      return filtered.filter(sub => sub.type === activeCategory);
    }
    
    return filtered;
  }, [displayMode, searchQuery, activeCategory]);
  
  // Encontra a subdivisão atual
  const currentDefinition = useMemo(() => {
    const allSubs = [
      ...SUBDIVISION_DEFINITIONS.BINARY,
      ...SUBDIVISION_DEFINITIONS.TRIPLET,
      ...SUBDIVISION_DEFINITIONS.IRREGULAR
    ];
    return allSubs.find(sub => sub.value === currentSubdivision) || 
           SUBDIVISION_DEFINITIONS.BINARY[1]; // Fallback para colcheias
  }, [currentSubdivision]);
  
  // Manipulador de mudança de subdivisão
  const handleSubdivisionChange = useCallback((subdivision) => {
    onSubdivisionChange(subdivision);
    setIsOpen(false);
    setSearchQuery('');
  }, [onSubdivisionChange]);
  
  // Calcula informações da tercina atual
  const getTupletInfo = useCallback((subdivision) => {
    const def = availableSubdivisions.find(s => s.value === subdivision);
    
    if (!def || def.type !== 'TRIPLET') return null;
    
    // Para tercinas de semínima (valor 3)
    if (subdivision === 3) {
      return {
        name: 'Tercina de Semínima',
        description: '3 notas tocadas no tempo de 2 colcheias',
        notation: '[3]',
        ratio: '3:2',
        spacing: 0.666, // Duração de cada nota (em tempos)
        visualPattern: [1, 0.8, 0.6], // Padrão de volume para criar "sensação" ternária
        accentPattern: [1, 0.3, 0.6], // Padrão de acento sugerido
        isTriplet: true,
        tupletType: 'SEMINIMA'
      };
    }
    
    // Para tercinas de colcheia (valor 6)
    if (subdivision === 6) {
      return {
        name: 'Tercina de Colcheia',
        description: '6 notas tocadas no tempo de 4 semicolcheias',
        notation: '[6]',
        ratio: '3:2',
        spacing: 0.333,
        visualPattern: [1, 0.7, 0.4, 0.7, 0.4, 0.7],
        accentPattern: [1, 0.2, 0.4, 0.2, 0.4, 0.2],
        isTriplet: true,
        tupletType: 'COLCHIA'
      };
    }
    
    // Para tercinas de semicolcheia (valor 12)
    if (subdivision === 12) {
      return {
        name: 'Tercina de Semicolcheia',
        description: '12 notas tocadas no tempo de 8 fusas',
        notation: '[12]',
        ratio: '3:2',
        spacing: 0.166,
        visualPattern: Array(12).fill(0.5).map((_, i) => 0.3 + (i % 3 === 0 ? 0.4 : 0)),
        accentPattern: Array(12).fill(0.2).map((_, i) => i % 3 === 0 ? 0.8 : 0.2),
        isTriplet: true,
        tupletType: 'SEMICOLCHIA'
      };
    }
    
    return null;
  }, [availableSubdivisions]);
  
  // Renderiza o botão principal
  const renderTrigger = () => {
    const CurrentIcon = currentDefinition.icon || Music;
    const tupletInfo = getTupletInfo(currentSubdivision);
    
    return (
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-200
          ${compact ? 'py-2 px-3 text-sm' : ''}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700' 
            : 'hover:scale-[1.02] active:scale-[0.98]'
          }
          ${theme === 'pro-gold' 
            ? 'bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-700/30 hover:border-amber-500/50' 
            : 'bg-gray-900/50 border border-gray-700 hover:border-gray-600'
          }
          ${className}
        `}
        aria-label={`Selecionar subdivisão: ${currentDefinition.label}`}
      >
        {/* Ícone e valor */}
        <div className={`p-2 rounded-lg ${currentDefinition.color}/20`}>
          <CurrentIcon 
            size={compact ? 16 : 20} 
            className={currentDefinition.color.replace('bg-', 'text-')}
          />
        </div>
        
        {/* Informações principais */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <div className={`text-lg font-black ${theme === 'pro-gold' ? 'text-amber-300' : 'text-white'}`}>
              {currentDefinition.symbol}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${compact ? 'text-sm' : 'text-base'} truncate`}>
                {currentDefinition.label}
              </div>
              {!compact && (
                <div className="text-xs text-gray-400 truncate">
                  {currentDefinition.description}
                </div>
              )}
            </div>
          </div>
          
          {/* Informações específicas de tercina */}
          {tupletInfo && !compact && (
            <div className="mt-1 flex items-center gap-2">
              <div className="px-2 py-0.5 bg-amber-900/30 rounded text-xs text-amber-300">
                {tupletInfo.notation}
              </div>
              <div className="text-xs text-amber-400/70">
                {tupletInfo.ratio}
              </div>
            </div>
          )}
        </div>
        
        {/* Indicador de dropdown */}
        <ChevronDown 
          size={16} 
          className={`
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
            ${theme === 'pro-gold' ? 'text-amber-400' : 'text-gray-400'}
          `}
        />
      </button>
    );
  };
  
  // Renderiza uma opção de subdivisão
  const renderOption = (subdivision) => {
    const SubdivisionIcon = subdivision.icon || Music;
    const isCurrent = subdivision.value === currentSubdivision;
    const isTriplet = subdivision.type === 'TRIPLET';
    const isIrregular = subdivision.type === 'IRREGULAR';
    
    return (
      <button
        key={subdivision.value}
        onClick={() => handleSubdivisionChange(subdivision.value)}
        className={`
          flex items-center gap-3 p-3 rounded-xl text-left
          transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]
          ${isCurrent 
            ? `${subdivision.color.replace('bg-', 'bg-')}/20 border ${subdivision.color.replace('bg-', 'border-')}/40` 
            : 'hover:bg-gray-800/50'
          }
          ${isTriplet ? 'border-l-4 border-amber-500/50' : ''}
          ${isIrregular ? 'border-l-4 border-indigo-500/50' : ''}
        `}
      >
        {/* Ícone */}
        <div className={`
          p-2 rounded-lg ${subdivision.color}/20
          ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}
        `}>
          <SubdivisionIcon 
            size={20} 
            className={subdivision.color.replace('bg-', 'text-')}
          />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`text-xl font-black ${subdivision.color.replace('bg-', 'text-')}`}>
              {subdivision.symbol}
            </div>
            <div className="font-bold">{subdivision.label}</div>
            {isTriplet && (
              <div className="ml-auto px-2 py-0.5 bg-amber-900/30 rounded text-xs text-amber-300">
                TERCINA
              </div>
            )}
            {isIrregular && (
              <div className="ml-auto px-2 py-0.5 bg-indigo-900/30 rounded text-xs text-indigo-300">
                IRREGULAR
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            {subdivision.description}
          </div>
          
          {/* Informações técnicas */}
          <div className="flex items-center gap-3 mt-2 text-xs">
            <div className="text-gray-500">
              Valor: <span className="text-white font-mono">{subdivision.value}</span>
            </div>
            <div className="text-gray-500">
              Duração: <span className="text-white font-mono">{subdivision.duration}</span>
            </div>
            <div className="text-gray-500">
              Razão: <span className="text-white font-mono">{subdivision.ratio}</span>
            </div>
          </div>
          
          {/* Indicador visual da tercina */}
          {isTriplet && subdivision.value === 3 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="text-xs text-amber-400/70">Padrão ternário:</div>
              <div className="flex gap-1">
                {[1, 0.8, 0.6].map((height, index) => (
                  <div
                    key={index}
                    className="w-2 rounded-sm bg-gradient-to-t from-amber-500 to-amber-300"
                    style={{ height: `${height * 12}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };
  
  // Renderiza categorias para filtro
  const renderCategoryFilter = () => {
    const categories = [
      { id: 'ALL', label: 'Todas', count: availableSubdivisions.length },
      { id: 'BINARY', label: 'Binárias', count: SUBDIVISION_DEFINITIONS.BINARY.length },
      { id: 'TRIPLET', label: 'Tercinas', count: SUBDIVISION_DEFINITIONS.TRIPLET.length },
      { id: 'IRREGULAR', label: 'Irregulares', count: SUBDIVISION_DEFINITIONS.IRREGULAR.length },
    ];
    
    return (
      <div className="flex gap-2 mb-4 p-1 bg-gray-900/50 rounded-lg">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex-1 px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${activeCategory === category.id 
                ? `${theme === 'pro-gold' ? 'bg-amber-500 text-black' : 'bg-gray-700 text-white'}` 
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {category.label}
            <span className="ml-1 text-xs opacity-70">
              ({category.count})
            </span>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative">
      {/* Trigger */}
      {renderTrigger()}
      
      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className={`
          absolute top-full mt-2 left-0 right-0
          bg-gray-950 border border-gray-800 rounded-xl
          shadow-2xl z-50 max-h-[60vh] overflow-y-auto
          ${compact ? 'w-80' : 'w-96'}
        `}>
          {/* Cabeçalho */}
          <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Selecionar Subdivisão</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded"
                aria-label="Fechar"
              >
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
            
            {/* Barra de busca */}
            <input
              type="text"
              placeholder="Buscar subdivisão..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Filtro de categorias */}
            {showAdvanced && renderCategoryFilter()}
          </div>
          
          {/* Conteúdo */}
          <div className="p-3">
            {/* Seção de subdivisões binárias */}
            {activeCategory === 'ALL' || activeCategory === 'BINARY' ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-0.5 bg-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-400">SUBDIVISÕES BINÁRIAS</h4>
                </div>
                <div className="space-y-2">
                  {SUBDIVISION_DEFINITIONS.BINARY
                    .filter(sub => availableSubdivisions.includes(sub))
                    .map(renderOption)}
                </div>
              </div>
            ) : null}
            
            {/* Seção de tercinas */}
            {activeCategory === 'ALL' || activeCategory === 'TRIPLET' ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-0.5 bg-amber-500" />
                  <h4 className="text-sm font-semibold text-gray-400">TERCINAS</h4>
                  <div className="ml-auto text-xs text-amber-400/70 px-2 py-0.5 bg-amber-900/20 rounded">
                    {SUBDIVISION_DEFINITIONS.TRIPLET.length} tipos
                  </div>
                </div>
                <div className="space-y-2">
                  {SUBDIVISION_DEFINITIONS.TRIPLET
                    .filter(sub => availableSubdivisions.includes(sub))
                    .map(renderOption)}
                </div>
                
                {/* Informação educacional sobre tercinas */}
                <div className="mt-4 p-3 bg-amber-900/10 border border-amber-800/30 rounded-lg">
                  <div className="text-sm text-amber-300 mb-1">ℹ️ Sobre Tercinas</div>
                  <div className="text-xs text-amber-400/80">
                    Tercinas são grupos de 3 notas tocadas no tempo normalmente ocupado por 2 notas de valor igual.
                    Exemplo: Uma tercina de semínima = 3 notas no tempo de 2 colcheias.
                  </div>
                </div>
              </div>
            ) : null}
            
            {/* Seção de subdivisões irregulares */}
            {activeCategory === 'ALL' || activeCategory === 'IRREGULAR' ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-0.5 bg-indigo-500" />
                  <h4 className="text-sm font-semibold text-gray-400">SUBDIVISÕES IRREGULARES</h4>
                </div>
                <div className="space-y-2">
                  {SUBDIVISION_DEFINITIONS.IRREGULAR
                    .filter(sub => availableSubdivisions.includes(sub))
                    .map(renderOption)}
                </div>
              </div>
            ) : null}
            
            {/* Mensagem de nenhum resultado */}
            {availableSubdivisions.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Nenhuma subdivisão encontrada
              </div>
            )}
          </div>
          
          {/* Rodapé */}
          <div className="sticky bottom-0 bg-gray-950/95 backdrop-blur-sm p-3 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Subdivisão atual: <span className="text-white">{currentDefinition.label}</span></span>
                <span>Total: <span className="text-white">{availableSubdivisions.length}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Helper para obter informações de tercina para uso externo
export const getTripletInfo = (subdivisionValue) => {
  const allSubs = [
    ...SUBDIVISION_DEFINITIONS.BINARY,
    ...SUBDIVISION_DEFINITIONS.TRIPLET,
    ...SUBDIVISION_DEFINITIONS.IRREGULAR
  ];
  
  const subdivision = allSubs.find(s => s.value === subdivisionValue);
  
  if (!subdivision || subdivision.type !== 'TRIPLET') {
    return null;
  }
  
  // Retorna configuração específica para cada tipo de tercina
  switch (subdivisionValue) {
    case 3: // Tercina de semínima
      return {
        name: 'Tercina de Semínima',
        ratio: '3:2',
        spacing: 0.666, // Cada nota dura 2/3 de um tempo
        accentPattern: [1, 0.3, 0.6],
        ghostPattern: [1, 0.2, 0.8],
        swingPattern: [0.95, 1.05, 1.0], // Leve swing ternário
        visualGuide: '3 notas igualmente espaçadas dentro de 2 tempos'
      };
      
    case 6: // Tercina de colcheia
      return {
        name: 'Tercina de Colcheia',
        ratio: '3:2',
        spacing: 0.333,
        accentPattern: [1, 0.2, 0.4, 0.2, 0.4, 0.2],
        ghostPattern: [1, 0.1, 0.3, 0.1, 0.3, 0.1],
        swingPattern: Array(6).fill(1).map((_, i) => 0.9 + (i % 3 === 1 ? 0.2 : 0)),
        visualGuide: '6 notas em grupos de 3 dentro de 2 tempos'
      };
      
    case 12: // Tercina de semicolcheia
      return {
        name: 'Tercina de Semicolcheia',
        ratio: '3:2',
        spacing: 0.166,
        accentPattern: Array(12).fill(0.2).map((_, i) => i % 3 === 0 ? 0.8 : 0.2),
        ghostPattern: Array(12).fill(0.1).map((_, i) => i % 3 === 0 ? 0.6 : 0.1),
        swingPattern: Array(12).fill(1).map((_, i) => 0.95 + (i % 3 === 1 ? 0.1 : 0)),
        visualGuide: '12 notas em grupos de 3 dentro de 2 tempos'
      };
      
    default:
      return null;
  }
};

// Helper para calcular o timing correto de tercinas
export const calculateTripletTiming = (bpm, subdivisionValue) => {
  const tripletInfo = getTripletInfo(subdivisionValue);
  
  if (!tripletInfo) {
    // Retorna timing binário padrão
    return {
      stepDuration: (60000 / bpm) / subdivisionValue,
      isTriplet: false
    };
  }
  
  // Para tercinas, ajustamos a duração
  // Ex: Para tercina de semínima (3), cada nota dura (60000/bpm) * (2/3)
  const beatDuration = 60000 / bpm;
  const tripletDuration = beatDuration * (2 / 3); // Duração total das 3 notas
  
  return {
    stepDuration: tripletDuration / 3, // Cada uma das 3 notas
    tripletDuration,
    isTriplet: true,
    ...tripletInfo
  };
};

export default React.memo(SubdivisionSelector);
