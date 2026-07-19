import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nerofit | A plataforma definitiva para Personal Trainers e Nutricionistas',
  description: 'Tudo que você precisa para alavancar sua carreira. Gestão financeira, agenda automática, fichas de treino, dieta e CRM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
