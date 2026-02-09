import React, { useState } from 'react';
import { IslamicHilal } from '@/icons/IslamicHilal';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Play,
  Users,
  Eye,
  Palette,
  Globe,
  ArrowRight,
  Settings,
  Moon,
  Sun,
  Languages,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ChessPiece } from '@/components/chess/ChessPieces';

const Index: React.FC = () => {
  const { t, dir } = useLanguage();


  const [joinCode, setJoinCode] = useState('');
  const [spectateCode, setSpectateCode] = useState('');
const { mode, toggleMode } = useTheme();

  const features = [
    {
      icon: IslamicHilal,
      title: t('home.features.realtime'),
      desc: t('home.features.realtimeDesc'),
    },
    {
      icon: Palette,
      title: t('home.features.themes'),
      desc: t('home.features.themesDesc'),
    },
    {
      icon: Globe,
      title: t('home.features.multilang'),
      desc: t('home.features.multilangDesc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background geometric-pattern" dir={dir}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ChessPiece
              type="king"
              color={mode === 'dark' ? 'white' : 'black'}
              size={40}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('welcomeTitle')}
            </span>
          </Link>
<div className="flex items-center gap-2">
  <Button
    variant="ghost"
    size="icon"
    onClick={toggleMode}
  >
    {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </Button>

  <Link to="/settings">
    <Button variant="ghost" size="icon">
      <Settings className="w-5 h-5" />
    </Button>
  </Link>
</div>

        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="space-y-20"
        >
          {/* Hero */}
          <motion.section
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <ChessPiece
                type="king"
                color={mode === 'dark' ? 'white' : 'black'}
                size={120}
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
              {t('welcomeTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('welcomeSubtitle')}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <Link to="/create">
                <Button size="lg" className="gap-2 px-8">
                  <Play className="w-5 h-5" />
                  {t('createRoom')}
                </Button>
              </Link>

              {/* Join */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="gap-2 px-8">
                    <Users className="w-5 h-5" />
                    {t('joinRoom')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('joinRoom')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder={t('enterCode')}
                      className="text-center text-lg font-mono tracking-widest"
                      maxLength={8}
                    />
                    <Link to={joinCode ? `/game/${joinCode}` : '#'}>
                      <Button className="w-full" disabled={!joinCode}>
                        {t('joinGame')}
                      </Button>
                    </Link>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Spectate */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="ghost" className="gap-2">
                    <Eye className="w-5 h-5" />
                    {t('home.spectate')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('home.spectate')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      value={spectateCode}
                      onChange={(e) => setSpectateCode(e.target.value.toUpperCase())}
                      placeholder={t('enterCode')}
                      className="text-center text-lg font-mono tracking-widest"
                      maxLength={8}
                    />
                    <Link to={spectateCode ? `/spectate/${spectateCode}` : '#'}>
                      <Button className="w-full" disabled={!spectateCode}>
                        {t('joinGame')}
                      </Button>
                    </Link>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.section>

          {/* Features */}
          <motion.section className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border-2 hover:border-primary/50">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{f.title}</h3>
                      <p className="text-muted-foreground text-sm">{f.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.section>

          {/* CTA */}
          <motion.section className="text-center">
            <Link to="/create">
              <Button size="lg" className="gap-2 group">
                {t('createRoom')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-sm text-muted-foreground w-full">
        ♟ Designed with Islamic aesthetics in mind ♟
      </footer>


    </div>
  );
};

export default Index;
