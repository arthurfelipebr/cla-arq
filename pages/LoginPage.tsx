
import React, { useState } from 'react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { MOCK_USER, MOCK_CREDENTIALS, MOCK_DEMO_CREDENTIALS } from '../constants';
import { Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
        (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) ||
        (email === MOCK_DEMO_CREDENTIALS.email && password === MOCK_DEMO_CREDENTIALS.password)
    ) {
      // For demo purposes, both credentials log in as MOCK_USER.
      // In a real app, demo user might have a different user object.
      login('mock-jwt-token', MOCK_USER);
      // Successful login, App component will handle redirect
    } else {
      setError('E-mail ou senha inválidos.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-clarissa-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-2xl shadow-float">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-clarissa-primary mb-2">Bem-vinda!</h1>
          <p className="text-clarissa-secondary">Acesse o painel de gestão Clarissa Dario Arquitetura.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="E-mail"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            icon={<Mail />}
            disabled={isLoading}
          />
          <Input
            label="Senha"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            icon={<Lock />}
            disabled={isLoading}
          />

          {error && (
            <p className="text-sm text-clarissa-danger text-center">{error}</p>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-clarissa-secondary">
            Esqueceu sua senha? <a href="#" className="font-medium text-clarissa-primary hover:text-clarissa-primaryhover">Recuperar senha</a>
        </p>
      </div>
       <footer className="mt-10 text-center text-sm text-clarissa-secondary">
        &copy; {new Date().getFullYear()} Clarissa Dario Arquitetura. Todos os direitos reservados.
      </footer>
    </div>
  );
};