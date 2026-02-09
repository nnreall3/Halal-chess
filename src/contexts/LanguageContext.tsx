import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation & Common
  home: { en: 'Home', ar: 'الرئيسية' },
  play: { en: 'Play', ar: 'العب' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  joinGame: { en: 'Join Game', ar: 'انضم للعبة' },
  
  // Home Page
  welcomeTitle: { en: 'Islamic Chess', ar: 'الشطرنج الإسلامي' },
  welcomeSubtitle: { en: 'A beautiful, culturally respectful chess experience', ar: 'تجربة شطرنج جميلة ومحترمة ثقافياً' },
  playNow: { en: 'Play Now', ar: 'العب الآن' },
  createRoom: { en: 'Create Room', ar: 'إنشاء غرفة' },
  joinRoom: { en: 'Join Room', ar: 'انضم لغرفة' },
  // Home Features
  'home.spectate':({ en: 'Spectate', ar: 'المشاهدة' }),
'home.features.realtime': { en: 'Halal chess website',  ar: 'موقع شطرنج حلال',},
'home.features.realtimeDesc': {  en: 'A halal chess without the haram things',  ar: 'شطرنج حلال بدون أشياء حرام',},
'home.features.themes': {  en: 'Customizable Themes',  ar: 'تخصيص المظهر',},
'home.features.themesDesc': {  en: 'Choose colors and appearance that suit you',  ar: 'اختر الألوان والمظهر الذي يناسبك',},
'home.features.multilang': {  en: 'Multi-language Support',  ar: 'دعم تعدد اللغات',},
'home.features.multilangDesc': {  en: 'Play in multiple languages with RTL support',  ar: 'العب بلغات متعددة مع دعم الاتجاه من اليمين لليسار',},
  // Game Setup
  gameSetup: { en: 'Game Setup', ar: 'إعداد اللعبة' },
  timeControl: { en: 'Time Control', ar: 'التحكم بالوقت' },
  minutes: { en: 'minutes', ar: 'دقائق' },
  increment: { en: 'increment', ar: 'زيادة' },
  seconds: { en: 'seconds', ar: 'ثواني' },
  allowSpectators: { en: 'Allow Spectators', ar: 'السماح للمشاهدين' },
  startGame: { en: 'Start Game', ar: 'ابدأ اللعبة' },
  yourName: { en: 'Your Name', ar: 'اسمك' },
  
  // Room Codes
  playerCode: { en: 'Player Code', ar: 'رمز اللاعب' },
  spectatorCode: { en: 'Spectator Code', ar: 'رمز المشاهد' },
  copyCode: { en: 'Copy', ar: 'نسخ' },
  codeCopied: { en: 'Copied!', ar: 'تم النسخ!' },
  enterCode: { en: 'Enter room code', ar: 'أدخل رمز الغرفة' },
  
  // Game Status
  yourTurn: { en: 'Your Turn', ar: 'دورك' },
  opponentTurn: { en: "Opponent's Turn", ar: 'دور الخصم' },
  waitingForOpponent: { en: 'Waiting for opponent...', ar: 'في انتظار الخصم...' },
  gameOver: { en: 'Game Over', ar: 'انتهت اللعبة' },
  checkmate: { en: 'Checkmate!', ar: 'كش ملك!' },
  stalemate: { en: 'Stalemate!', ar: 'تعادل!' },
  check: { en: 'Check!', ar: 'كش!' },
  whiteWins: { en: 'White Wins!', ar: 'الأبيض يفوز!' },
  blackWins: { en: 'Black Wins!', ar: 'الأسود يفوز!' },
  draw: { en: 'Draw', ar: 'تعادل' },
  resign: { en: 'Resign', ar: 'استسلم' },
  offerDraw: { en: 'Offer Draw', ar: 'عرض التعادل' },
    drawOfferReceived: { en: 'Opponent offers a draw', ar: 'الخصم يعرض التعادل' },
  accept: { en: 'Accept', ar: 'قبول' },
  decline: { en: 'Decline', ar: 'رفض' },
  drawOfferPending: { en: 'Draw offer pending...', ar: 'عرض التعادل معلق...' },
  
  // Chat
  chat: { en: 'Chat', ar: 'المحادثة' },
  typeMessage: { en: 'Type a message...', ar: 'اكتب رسالة...' },
  send: { en: 'Send', ar: 'إرسال' },
  spectator: { en: 'Spectator', ar: 'مشاهد' },
  player: { en: 'Player', ar: 'لاعب' },
  
  // Settings
  language: { en: 'Language', ar: 'اللغة' },
  theme: { en: 'Theme', ar: 'المظهر' },
  colorTheme: { en: 'Color Theme', ar: 'لون المظهر' },
  darkMode: { en: 'Dark Mode', ar: 'الوضع الداكن' },
  lightMode: { en: 'Light Mode', ar: 'الوضع الفاتح' },
  emerald: { en: 'Emerald', ar: 'زمردي' },
  sapphire: { en: 'Sapphire', ar: 'ياقوتي' },
  rose: { en: 'Rose', ar: 'وردي' },
  amber: { en: 'Amber', ar: 'عنبري' },
  
  // Pieces (for accessibility)
  king: { en: 'King', ar: 'الملك' },
  queen: { en: 'Queen', ar: 'الوزير' },
  rook: { en: 'Rook', ar: 'القلعة' },
  bishop: { en: 'Bishop', ar: 'الفيل' },
  knight: { en: 'Knight', ar: 'الحصان' },
  pawn: { en: 'Pawn', ar: 'البيدق' },
  
  // Errors & Messages
  invalidMove: { en: 'Invalid move', ar: 'حركة غير صحيحة' },
  connectionLost: { en: 'Connection lost', ar: 'انقطع الاتصال' },
  reconnecting: { en: 'Reconnecting...', ar: 'جاري إعادة الاتصال...' },
  roomNotFound: { en: 'Room not found', ar: 'الغرفة غير موجودة' },
  roomFull: { en: 'Room is full', ar: 'الغرفة ممتلئة' },
  
  // Navigation
  backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
  newGame: { en: 'New Game', ar: 'لعبة جديدة' },
  leaveGame: { en: 'Leave Game', ar: 'مغادرة اللعبة' },
  shareRoom: { en: 'Share Room', ar: 'مشاركة الغرفة' },
  
  // Misc
  vs: { en: 'vs', ar: 'ضد' },
  white: { en: 'White', ar: 'أبيض' },
  black: { en: 'Black', ar: 'أسود' },
  moves: { en: 'Moves', ar: 'الحركات' },
  time: { en: 'Time', ar: 'الوقت' },
  loading: { en: 'Loading...', ar: 'جاري التحميل...' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('chess-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('chess-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
