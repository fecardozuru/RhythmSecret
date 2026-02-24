 página principal do metrônomo.
  *
   * Monta o layout principal com todos os componentes de controle e visualização.
    * O estado (BPM, volumes, playMode, etc.) vem de AppContext via hooks.
     * A lógica de áudio fica em useMetronomeEngine (chamado em App.jsx).
      */

      export default function AppPage() {
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
                                                                                                      