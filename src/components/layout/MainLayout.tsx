import React, { ReactNode } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = 'arregla.mx - Sistema de Reparación' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Sistema de gestión para reparación de dispositivos móviles" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout; 