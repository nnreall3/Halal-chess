import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Globe, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTheme, ColorTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const THEMES: { id: ColorTheme; name: { en: string; ar: string }; color: string }[] = [
  { id: 'emerald', name: { en: 'Emerald', ar: 'زمردي' }, color: 'bg-emerald-500' },
  { id: 'sapphire', name: { en: 'Sapphire', ar: 'ياقوتي' }, color: 'bg-blue-500' },
  { id: 'rose', name: { en: 'Rose', ar: 'وردي' }, color: 'bg-rose-500' },
  { id: 'amber', name: { en: 'Amber', ar: 'عنبري' }, color: 'bg-amber-500' },
];

const LANGUAGES: { id: Language; name: string; nativeName: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const SettingsPage: React.FC = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  const { colorTheme, mode, setColorTheme, toggleMode } = useTheme();

  return (
    <div className="min-h-screen bg-background geometric-pattern" dir={dir}>
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold">{t('settings')}</h1>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t('theme')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Light/Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {mode === 'dark' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  <Label>{mode === 'dark' ? t('darkMode') : t('lightMode')}</Label>
                </div>
                <Switch
                  checked={mode === 'dark'}
                  onCheckedChange={toggleMode}
                />
              </div>

              {/* Color Themes */}
              <div className="space-y-3">
                <Label>{t('colorTheme')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => setColorTheme(theme.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 transition-all text-left',
                        colorTheme === theme.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('w-6 h-6 rounded-full', theme.color)} />
                        <span className="font-medium">{theme.name[language]}</span>
                      </div>
                      {colorTheme === theme.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <motion.button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all',
                      language === lang.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <p className="font-medium">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang.name}
                      </p>
                    </div>
                    {language === lang.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">♟ Islamic Chess ♟</p>
                <p>A culturally respectful chess experience with geometric piece designs.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
