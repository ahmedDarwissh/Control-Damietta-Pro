import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';

interface SymbolCardProps {
  symbol: string; 
  nameKey: string; 
  descriptionKey?: string; 
}

const SymbolCard: React.FC<SymbolCardProps> = ({ symbol, nameKey, descriptionKey }) => {
  const { translate, language } = useLocalization();
  return (
    <div className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-lg border border-csp-base-200 dark:border-csp-base-dark-300">
      <div className="pid-symbol text-csp-accent mb-2">{symbol}</div>
      <h3 className={`text-md font-semibold text-csp-primary dark:text-csp-base-dark-content ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{translate(nameKey as any)}</h3>
      {descriptionKey && <p className="text-xs text-csp-secondary dark:text-gray-400 mt-1">{translate(descriptionKey as any)}</p>}
    </div>
  );
};


const PIDSymbolsPage: React.FC = () => {
  const { translate, language } = useLocalization();

  const symbols = [
    { symbol: '밸', nameKey: 'pidValve', descriptionKey: 'Represents various types of valves (gate, globe, ball, etc.)' }, 
    { symbol: '펌', nameKey: 'pidPump', descriptionKey: 'Typically for centrifugal or positive displacement pumps' },
    { symbol: '탱', nameKey: 'pidTank', descriptionKey: 'Storage for liquids, often with level indicators' },
    { symbol: '⇆', nameKey: 'pidHeatExchanger', descriptionKey: 'Transfers heat between two or more fluids' },
    { symbol: '⚙️', nameKey: 'pidCompressor', descriptionKey: 'Increases the pressure of a gas' },
    { symbol: '◎', nameKey: 'pidInstrument', descriptionKey: 'General instrument bubble, specific letter codes inside indicate type' },
  ];

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <style>{`
        .pid-symbol {
            font-family: 'Arial', sans-serif; 
            font-size: 2em; /* Slightly smaller for mobile cards */
            margin: 4px auto; /* Centered with less margin */
            display: inline-block;
            color: var(--theme-csp-accent);
        }
      `}</style>
      {/* Title handled by main Header */}
      <p className="text-sm text-csp-secondary dark:text-gray-300">{translate('pidIntro')}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {/* Adjusted grid for mobile */}
        {symbols.map(s => <SymbolCard key={s.nameKey} symbol={s.symbol} nameKey={s.nameKey} />)}
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-csp-primary-focus/50 rounded-lg shadow-sm">
        <h3 className={`text-sm font-semibold text-csp-primary dark:text-csp-accent mb-1 ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>
            {language === 'ar' ? 'ملاحظة:' : 'Note:'}
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-200">
            {language === 'ar' ? 'هذه مجرد أمثلة بسيطة. رموز P&ID الفعلية قد تكون أكثر تفصيلاً وتحتوي على معلومات إضافية بناءً على معايير الصناعة (مثل ISA S5.1).' : 'These are simplified examples. Actual P&ID symbols can be more detailed and contain additional information based on industry standards (e.g., ISA S5.1).'}
        </p>
      </div>
    </div>
  );
};

export default PIDSymbolsPage;