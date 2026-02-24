import React from 'react';
import { MetronomeDisplay } from '../components/ui';
import { BpmDial } from '../components/ui';
import { SubdivisionGrid } from '../components/ui';
import { VolumeColumn } from '../components/ui';
import { ModeSelector } from '../components/ui';
import { GapToggle, GhostModeToggle, PermutationToggle, PresetManager } from '../components/pro-features';
import { AIAssistant } from '../components/ai';
import Layout from '../components/Layout';

/**
 * AppPage - Página principal da aplicação após login.
  * Agrupa todos os componentes de controle e visualização.
   * Estado global (BPM, volumes, playMode, etc.) vem de AppContext via hooks.
    * Lógica de áudio fica em useMetronomeEngine (chamado em App.jsx).
     */
     function AppPage() {
       return (
           <Layout>
                 <MetronomeDisplay />
                       <BpmDial />
                             <SubdivisionGrid />
                                   <VolumeColumn />
                                         <ModeSelector />
                                               {/* Pro Features */}
                                                     <div className="flex flex-wrap gap-2 justify-center">
                                                             <GapToggle />
                                                                     <GhostModeToggle />
                                                                             <PermutationToggle />
                                                                                   </div>
                                                                                         <PresetManager />
                                                                                               <AIAssistant />
                                                                                                   </Layout>
                                                                                                     );
                                                                                                     }

                                                                                                     export default AppPage;