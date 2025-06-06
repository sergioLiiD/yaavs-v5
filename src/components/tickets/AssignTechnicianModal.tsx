import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Tecnico {
  id: number;
  nombre: string;
}

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onAssign: () => void;
}

export function AssignTechnicianModal({ isOpen, onClose, ticketId, onAssign }: AssignTechnicianModalProps) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const response = await fetch('/api/usuarios/tecnicos');
        if (!response.ok) throw new Error('Error al cargar técnicos');
        const data = await response.json();
        setTecnicos(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar la lista de técnicos');
      }
    };

    if (isOpen) {
      fetchTecnicos();
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedTecnico) {
      toast.error('Por favor selecciona un técnico');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tecnicoId: parseInt(selectedTecnico) }),
      });

      if (!response.ok) throw new Error('Error al asignar técnico');

      toast.success('Técnico asignado correctamente');
      onAssign();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al asignar técnico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Técnico</DialogTitle>
          <DialogDescription>
            Selecciona el técnico que se encargará de la reparación
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedTecnico}
            onValueChange={setSelectedTecnico}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar técnico" />
            </SelectTrigger>
            <SelectContent>
              {tecnicos.map((tecnico) => (
                <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                  {tecnico.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 