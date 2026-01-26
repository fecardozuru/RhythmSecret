// /src/components/pro-features/PresetManager.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Copy,
  Edit2,
  Check,
  X,
  Download,
  Upload,
  Lock,
  Unlock,
  Zap,
  RotateCw,
  MoreVertical,
  Star,
  Clock,
  User,
  Cloud,
  HardDrive
} from 'lucide-react';
import { formatPresetSlot, formatRelativeTime, formatNumber } from '../../utils/formatters';
import { useMenuManagement } from '../../hooks/useMenuManagement';

/**
 * PresetManager - Gerenciador de slots de memória para modo PRO
 * Save/Load de configurações com sincronização em nuvem
 */
const PresetManager = ({
  slots = {},
  currentSlot = 1,
  user = null,
  isSyncing = false,
  lastSync = null,
  onSave,
  onLoad,
  onDelete,
  onRename,
  onExport,
  onImport,
  onSync,
  showCloudFeatures = true,
  compact = false,
  theme = 'pro-gold',
  className = '',
}) => {
  const [localSlots, setLocalSlots] = useState(slots);
  const [localCurrentSlot, setLocalCurrentSlot] = useState(currentSlot);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editName, setEditName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [selectedSlotForMenu, setSelectedSlotForMenu] = useState(null);
  
  // Menu de contexto para slots
  const slotMenu = useMenuManagement('preset-slot-menu', {
    closeOnClickOutside: true,
    closeOnEsc: true,
    autoZIndex: true,
  });
  
  // Atualiza estados locais quando props mudam
  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);
  
  useEffect(() => {
    setLocalCurrentSlot(currentSlot);
  }, [currentSlot]);
  
  // Inicializa slots padrão se não existirem
  useEffect(() => {
    const initializedSlots = { ...localSlots };
    for (let i = 1; i <= 3; i++) {
      if (!initializedSlots[i]) {
        initializedSlots[i] = {
          id: i,
          name: `Slot ${i}`,
          isEmpty: true,
          createdAt: null,
          updatedAt: null,
          bpm: 120,
          timeSignature: { numerator: 4, denominator: 4 },
          volumes: [1.0, 0.3, 0.6, 0.3],
          sequence: [],
        };
      }
    }
    setLocalSlots(initializedSlots);
  }, []);
  
  // Temas de cores específicos para features PRO
  const themeColors = {
    'pro-gold': {
      bg: 'bg-gradient-to-br from-gray-950 to-amber-950/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      active: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      slotActive: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30',
      slotInactive: 'bg-gray-800/50',
      accent: 'text-amber-400',
      highlight: 'bg-amber-500/10',
    },
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      active: 'bg-blue-500/20',
      slotActive: 'bg-blue-500/30',
      slotInactive: 'bg-gray-800/50',
      accent: 'text-blue-400',
      highlight: 'bg-blue-500/10',
    },
  };
  
  const colors = themeColors[theme] || themeColors['pro-gold'];
  
  // Manipuladores de eventos
  const handleSave = useCallback((slotId) => {
    if (onSave) {
      onSave(slotId);
    }
  }, [onSave]);
  
  const handleLoad = useCallback((slotId) => {
    setLocalCurrentSlot(slotId);
    
    if (onLoad) {
      onLoad(slotId);
    }
  }, [onLoad]);
  
  const handleDelete = useCallback((slotId) => {
    if (onDelete) {
      onDelete(slotId);
    }
  }, [onDelete]);
  
  const handleRename = useCallback((slotId, newName) => {
    if (onRename && newName.trim()) {
      onRename(slotId, newName.trim());
      setEditingSlot(null);
      setEditName('');
    }
  }, [onRename]);
  
  const handleExport = useCallback((slotId) => {
    if (onExport) {
      onExport(slotId);
    }
  }, [onExport]);
  
  const handleImport = useCallback(() => {
    if (onImport && importData.trim()) {
      onImport(importData);
      setShowImportModal(false);
      setImportData('');
    }
  }, [onImport, importData]);
  
  const handleSync = useCallback(() => {
    if (onSync) {
      onSync();
    }
  }, [onSync]);
  
  const startEditing = useCallback((slotId, currentName) => {
    setEditingSlot(slotId);
    setEditName(currentName);
  }, []);
  
  const cancelEditing = useCallback(() => {
    setEditingSlot(null);
    setEditName('');
  }, []);
  
  const openSlotMenu = useCallback((slotId, event) => {
    event.stopPropagation();
    setSelectedSlotForMenu(slotId);
    slotMenu.openMenu();
  }, [slotMenu]);
  
  // Renderiza um slot individual
  const renderSlot = useCallback((slotId) => {
    const slot = localSlots[slotId] || { isEmpty: true, name: `Slot ${slotId}` };
    const isCurrent = slotId === localCurrentSlot;
    const isEmpty = slot.isEmpty;
    const isEditing = editingSlot === slotId;
    const slotInfo = formatPresetSlot(slotId, !isEmpty);
    
    return (
      <div
        key={slotId}
        className={`
          relative p-4 rounded-xl transition-all duration-200
          ${isCurrent ? colors.slotActive : colors.slotInactive}
          border ${isCurrent ? 'border-amber-500/50' : colors.border}
          cursor-pointer hover:scale-105 active:scale-95
          ${slotMenu.isOpen && selectedSlotForMenu === slotId ? 'ring-2 ring-amber-400' : ''}
        `}
        onClick={() => !isEditing && handleLoad(slotId)}
        aria-label={`Slot ${slotId}: ${slot.name}${isCurrent ? ' (selecionado)' : ''}`}
        aria-selected={isCurrent}
        role="option"
      >
        {/* Indicador de slot atual */}
        {isCurrent && (
          <div className="absolute -top-2 -right-2">
            <div className="p-1.5 rounded-full bg-amber-500">
              <Check size={12} className="text-white" />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isEmpty ? 'bg-gray-700' : 'bg-amber-500/20'}`}>
              {isEmpty ? (
                <FolderOpen size={16} className="text-gray-400" />
              ) : (
                <Save size={16} className="text-amber-400" />
              )}
            </div>
            
            {isEditing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-800 border border-amber-500/50 rounded px-2 py-1 text-white text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(slotId, editName);
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  aria-label="Novo nome do preset"
                />
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleRename(slotId, editName)}
                    className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-semibold text-white">{slot.name}</div>
                <div className="text-xs text-gray-400">
                  {isEmpty ? 'Vazio' : slotInfo.label.split('(')[1]?.replace(')', '') || 'Salvo'}
                </div>
              </div>
            )}
          </div>
          
          {/* Botão de menu de contexto */}
          {!isEditing && (
            <button
              onClick={(e) => openSlotMenu(slotId, e)}
              className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
              aria-label={`Menu do slot ${slotId}`}
              ref={selectedSlotForMenu === slotId ? slotMenu.triggerRef : null}
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Informações do slot */}
        {!isEmpty && !isEditing && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800/30 p-2 rounded text-center">
                <div className="text-gray-400">BPM</div>
                <div className="font-bold text-white">{slot.bpm || '--'}</div>
              </div>
              <div className="bg-gray-800/30 p-2 rounded text-center">
                <div className="text-gray-400">Compasso</div>
                <div className="font-bold text-white">
                  {slot.timeSignature?.numerator || '4'}/{slot.timeSignature?.denominator || '4'}
                </div>
              </div>
            </div>
            
            {slot.updatedAt && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                <span>Salvo {formatRelativeTime(new Date(slot.updatedAt).getTime())}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Indicador de slot vazio */}
        {isEmpty && !isEditing && (
          <div className="text-center py-2">
            <div className="text-sm text-gray-500">Slot vazio</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave(slotId);
              }}
              className="mt-2 px-3 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
              aria-label={`Salvar no slot ${slotId}`}
            >
              Salvar aqui
            </button>
          </div>
        )}
      </div>
    );
  }, [localSlots, localCurrentSlot, editingSlot, editName, colors, slotMenu, selectedSlotForMenu]);
  
  // Renderiza menu de contexto do slot
  const renderSlotMenu = () => {
    if (!slotMenu.isOpen || !selectedSlotForMenu) return null;
    
    const slot = localSlots[selectedSlotForMenu];
    const isEmpty = slot?.isEmpty;
    
    return (
      <div
        ref={slotMenu.menuRef}
        className={`
          absolute right-0 mt-2 w-48 rounded-lg shadow-2xl
          bg-gray-900 border border-gray-800 z-50
          animate-in fade-in slide-in-from-top-2 duration-200
        `}
        style={{ zIndex: slotMenu.zIndex }}
      >
        <div className="p-2">
          {/* Cabeçalho do menu */}
          <div className="p-2 border-b border-gray-800">
            <div className="text-xs text-gray-400">Slot {selectedSlotForMenu}</div>
            <div className="text-sm font-semibold text-white truncate">
              {slot?.name || `Slot ${selectedSlotForMenu}`}
            </div>
          </div>
          
          {/* Itens do menu */}
          <div className="py-1">
            {!isEmpty && (
              <>
                <button
                  onClick={() => {
                    handleLoad(selectedSlotForMenu);
                    slotMenu.closeMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
                  aria-label="Carregar preset"
                >
                  <FolderOpen size={14} />
                  <span>Carregar</span>
                </button>
                
                <button
                  onClick={() => {
                    startEditing(selectedSlotForMenu, slot.name);
                    slotMenu.closeMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
                  aria-label="Renomear preset"
                >
                  <Edit2 size={14} />
                  <span>Renomear</span>
                </button>
                
                <button
                  onClick={() => {
                    handleExport(selectedSlotForMenu);
                    slotMenu.closeMenu();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
                  aria-label="Exportar preset"
                >
                  <Download size={14} />
                  <span>Exportar</span>
                </button>
                
                <div className="border-t border-gray-800 my-1" />
              </>
            )}
            
            <button
              onClick={() => {
                handleSave(selectedSlotForMenu);
                slotMenu.closeMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
              aria-label="Salvar no slot"
            >
              <Save size={14} />
              <span>{isEmpty ? 'Salvar' : 'Sobrescrever'}</span>
            </button>
            
            {!isEmpty && (
              <button
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja deletar o preset "${slot.name}"?`)) {
                    handleDelete(selectedSlotForMenu);
                  }
                  slotMenu.closeMenu();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded"
                aria-label="Deletar preset"
              >
                <Trash2 size={14} />
                <span>Deletar</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Seta do menu */}
        <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
      </div>
    );
  };
  
  // Renderiza controles de nuvem
  const renderCloudControls = () => {
    if (!showCloudFeatures || compact) return null;
    
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
              <Cloud size={20} className="text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Sincronização em Nuvem</h4>
              <p className="text-xs text-gray-400">Backup automático dos seus presets</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isSyncing ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
            {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZADO'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User size={12} className="text-gray-400" />
              <div className="text-xs text-gray-400">Usuário</div>
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {user?.email || user?.uid?.slice(0, 8) || 'Anônimo'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className="text-gray-400" />
              <div className="text-xs text-gray-400">Última sinc.</div>
            </div>
            <div className="text-sm font-semibold text-white">
              {lastSync ? formatRelativeTime(lastSync) : 'Nunca'}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              transition-all duration-200
              ${isSyncing ? 'bg-gray-700' : 'bg-blue-500/20 hover:bg-blue-500/30'}
              text-blue-400
              ${isSyncing ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
            aria-label={isSyncing ? "Sincronizando..." : "Sincronizar com a nuvem"}
          >
            {isSyncing ? (
              <RotateCw size={16} className="animate-spin" />
            ) : (
              <Cloud size={16} />
            )}
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            aria-label="Importar preset"
          >
            <Upload size={16} />
            <span>Importar</span>
          </button>
        </div>
      </div>
    );
  };
  
  // Renderiza modal de importação
  const renderImportModal = () => {
    if (!showImportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload size={20} className="text-amber-400" />
              <h3 className="text-lg font-bold text-white">Importar Preset</h3>
            </div>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">
              Cole o JSON do preset exportado abaixo:
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm"
              placeholder='{"name": "Meu Preset", "bpm": 120, ...}'
              aria-label="Dados JSON do preset"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className={`
                flex-1 px-4 py-3 rounded-lg
                transition-all duration-200
                ${importData.trim() ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-700 cursor-not-allowed'}
                text-white font-semibold
                ${importData.trim() ? 'hover:scale-105 active:scale-95' : ''}
              `}
              aria-label="Importar preset"
            >
              Importar
            </button>
            <button
              onClick={() => setShowImportModal(false)}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza versão compacta
  const renderCompactView = () => {
    if (!compact) return null;
    
    const currentSlotData = localSlots[localCurrentSlot];
    
    return (
      <div className="space-y-3">
        {/* Botão de slot atual */}
        <button
          onClick={() => slotMenu.openMenu()}
          className={`
            flex items-center justify-between w-full p-3 rounded-xl
            transition-all duration-200
            ${colors.slotActive}
            border ${colors.border}
            ${colors.text} shadow-lg
            hover:scale-105 active:scale-95
          `}
          aria-label="Gerenciar presets"
          ref={slotMenu.triggerRef}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Save size={16} className="text-amber-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Slot {localCurrentSlot}</div>
              <div className="text-xs text-gray-400">
                {currentSlotData?.name || 'Sem nome'}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            {currentSlotData?.isEmpty ? 'Vazio' : 'Salvo'}
          </div>
        </button>
        
        {/* Menu de slots (aparece ao clicar) */}
        {renderSlotMenu()}
      </div>
    );
  };
  
  // Renderiza versão expandida
  const renderExpandedView = () => {
    if (compact) return null;
    
    return (
      <>
        {/* Grid de slots */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(renderSlot)}
        </div>
        
        {/* Controles rápidos */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleSave(localCurrentSlot)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors"
            aria-label="Salvar no slot atual"
          >
            <Save size={16} />
            <span>Salvar Atual</span>
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
            aria-label="Importar preset"
          >
            <Upload size={16} />
            <span>Importar</span>
          </button>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors disabled:opacity-50"
            aria-label="Sincronizar com nuvem"
          >
            {isSyncing ? (
              <RotateCw size={16} className="animate-spin" />
            ) : (
              <Cloud size={16} />
            )}
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
        
        {renderCloudControls()}
        {renderSlotMenu()}
      </>
    );
  };
  
  // Renderiza informações educacionais
  const renderEducationalInfo = () => {
    if (compact) return null;
    
    const savedCount = Object.values(localSlots).filter(slot => !slot.isEmpty).length;
    
    return (
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <div className="text-sm font-semibold text-white">Estatísticas</div>
          </div>
          <div className="text-xs text-gray-400">
            {savedCount} de 3 slots usados
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <HardDrive size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Salve configurações complexas para rápido acesso</span>
          </div>
          <div className="flex items-start gap-2">
            <Cloud size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Sincronize entre dispositivos com sua conta</span>
          </div>
          <div className="flex items-start gap-2">
            <Star size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Crie biblioteca pessoal de exercícios e grooves</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        {/* Cabeçalho com badge PRO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500">
              <Save size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Gerenciador de Presets</h3>
              <p className="text-xs text-gray-400">Feature exclusiva modo PRO</p>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-900/30 to-yellow-900/30 text-amber-400 text-xs font-semibold">
            PRO FEATURE
          </div>
        </div>
        
        {compact ? renderCompactView() : renderExpandedView()}
        
        {renderEducationalInfo()}
        {renderImportModal()}
        
        {/* Overlay para fechar menu */}
        {slotMenu.isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={slotMenu.closeMenu}
          />
        )}
        
        {/* Efeito visual de destaque */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-3xl blur-xl -z-10" />
      </div>
    </div>
  );
};

// Propriedades padrão
PresetManager.defaultProps = {
  slots: {},
  currentSlot: 1,
  user: null,
  isSyncing: false,
  lastSync: null,
  showCloudFeatures: true,
  compact: false,
  theme: 'pro-gold',
  className: '',
};

export default React.memo(PresetManager);
