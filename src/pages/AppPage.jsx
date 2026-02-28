import React from 'react';
import { MetronomeDisplay } from '../components/ui';
import { BpmDial } from '../components/ui';
import { SubdivisionGrid } from '../components/ui';
import { VolumeColumn } from '../components/ui';
import { ModeSelector } from '../components/ui';
import { GapToggle, GhostModeToggle, PermutationToggle, PresetManager } from '../components/pro-features';
import { AIAssistant } from '../components/ai';
import { Layout } from '../components/ui';

function AppPage() {
  return (
    <Layout>
      <div slot="bpm-controls">
        <MetronomeDisplay />
        <BpmDial />
        <ModeSelector />
      </div>
      <div slot="rhythm-controls">
        <SubdivisionGrid />
      </div>
      <div slot="theme-controls">
        <AIAssistant />
      </div>
      <div slot="volume-grid">
        <VolumeColumn />
      </div>
      <div slot="pro-features">
        <GapToggle />
        <GhostModeToggle />
        <PermutationToggle />
      </div>
      <div slot="loop-presets">
        <PresetManager />
      </div>
    </Layout>
  );
}

export default AppPage;
