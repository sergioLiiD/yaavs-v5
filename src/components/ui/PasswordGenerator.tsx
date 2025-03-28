import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
  label?: string;
}

export function PasswordGenerator({ onPasswordGenerated, label = 'Contraseña' }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    const length = Math.floor(Math.random() * 3) + 8; // 8-10 caracteres
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let generatedPassword = '';
    
    // Asegurar al menos un carácter de cada tipo
    generatedPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    generatedPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    generatedPassword += numbers[Math.floor(Math.random() * numbers.length)];
    generatedPassword += special[Math.floor(Math.random() * special.length)];
    
    // Completar el resto de la contraseña
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar la contraseña
    generatedPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(generatedPassword);
    onPasswordGenerated(generatedPassword);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    onPasswordGenerated(newPassword);
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          type="text"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Ingrese o genere una contraseña"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={generatePassword}
        className="whitespace-nowrap"
      >
        Generar
      </Button>
    </div>
  );
} 