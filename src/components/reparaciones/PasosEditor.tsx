'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HiTrash } from 'react-icons/hi';
import { GripVertical } from 'lucide-react';

interface Paso {
  id: string;
  contenido: string;
  orden: number;
}

interface PasosEditorProps {
  pasos: Paso[];
  onPasosChange: (pasos: Paso[]) => void;
}

export function PasosEditor({ pasos, onPasosChange }: PasosEditorProps) {
  const [nuevoPaso, setNuevoPaso] = useState('');

  const handleAgregarPaso = () => {
    if (!nuevoPaso.trim()) return;

    const paso: Paso = {
      id: Date.now().toString(),
      contenido: nuevoPaso.trim(),
      orden: pasos.length
    };

    onPasosChange([...pasos, paso]);
    setNuevoPaso('');
  };

  const handleEliminarPaso = (id: string) => {
    onPasosChange(pasos.filter(p => p.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(pasos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar el orden de los pasos
    const pasosActualizados = items.map((paso, index) => ({
      ...paso,
      orden: index
    }));

    onPasosChange(pasosActualizados);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Agregar nuevo paso..."
          value={nuevoPaso}
          onChange={(e) => setNuevoPaso(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAgregarPaso()}
          className="flex-1 block rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
        />
        <Button 
          onClick={handleAgregarPaso}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="pasos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {pasos.map((paso, index) => (
                <Draggable key={paso.id} draggableId={paso.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab"
                      >
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={paso.contenido}
                          onChange={(e) => {
                            const nuevosPasos = [...pasos];
                            nuevosPasos[index] = {
                              ...paso,
                              contenido: e.target.value
                            };
                            onPasosChange(nuevosPasos);
                          }}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] sm:text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleEliminarPaso(paso.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 