/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import BrandMemory from './components/BrandMemory';
import AIStudio from './components/AIStudio';
import Editor from './components/Editor';
import Profile from './components/Profile';
import Analyzer from './components/Analyzer';
import StyleFusion from './components/StyleFusion';
import { Page, Layer } from './types';
import { AuthProvider } from './components/AuthProvider';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [initialLayers, setInitialLayers] = useState<Layer[] | null>(null);

  const handleStudioComplete = (layers: Layer[]) => {
    setInitialLayers(layers);
    setCurrentPage('projects');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'memory':
        return <BrandMemory />;
      case 'ai-studio':
        return <AIStudio onComplete={handleStudioComplete} />;
      case 'analyzer':
        return <Analyzer />;
      case 'fusion':
        return <StyleFusion onFused={(dna) => console.log('Fused DNA:', dna)} />;
      case 'projects':
        return <Editor initialLayers={initialLayers} />; 
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AuthProvider>
  );
}
