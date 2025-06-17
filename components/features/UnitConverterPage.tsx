import React, { useState } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { UNIT_CONVERSION_TYPES } from '../../constants';

type ConversionCategory = keyof typeof UNIT_CONVERSION_TYPES;

const UnitConverterPage: React.FC = () => {
  const { translate, language } = useLocalization();

  const [category, setCategory] = useState<ConversionCategory>('temperature');
  const [fromUnit, setFromUnit] = useState(UNIT_CONVERSION_TYPES[category][0].id);
  const [toUnit, setToUnit] = useState(UNIT_CONVERSION_TYPES[category][1]?.id || UNIT_CONVERSION_TYPES[category][0].id);
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const handleCategoryChange = (newCategory: ConversionCategory) => {
    setCategory(newCategory);
    setFromUnit(UNIT_CONVERSION_TYPES[newCategory][0].id);
    setToUnit(UNIT_CONVERSION_TYPES[newCategory][1]?.id || UNIT_CONVERSION_TYPES[newCategory][0].id);
    setInputValue('');
    setResult('');
  };

  const convertValue = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult(language === 'ar' ? 'قيمة غير صالحة' : 'Invalid input');
      return;
    }

    let convertedValue: number | null = null;

    if (category === 'temperature') {
      if (fromUnit === 'C' && toUnit === 'F') convertedValue = (value * 9/5) + 32;
      else if (fromUnit === 'F' && toUnit === 'C') convertedValue = (value - 32) * 5/9;
      else if (fromUnit === 'C' && toUnit === 'K') convertedValue = value + 273.15;
      else if (fromUnit === 'K' && toUnit === 'C') convertedValue = value - 273.15;
      else if (fromUnit === 'F' && toUnit === 'K') convertedValue = (value - 32) * 5/9 + 273.15;
      else if (fromUnit === 'K' && toUnit === 'F') convertedValue = (value - 273.15) * 9/5 + 32;
      else if (fromUnit === toUnit) convertedValue = value;
    } else if (category === 'pressure') {
      // Basic conversions, more precise factors might be needed
      const toPSI = (val: number, unit: string) => {
        if (unit === 'bar') return val * 14.5038;
        if (unit === 'atm') return val * 14.6959;
        if (unit === 'kPa') return val * 0.145038;
        return val; // if psi
      };
      const fromPSI = (psiVal: number, targetUnit: string) => {
        if (targetUnit === 'bar') return psiVal / 14.5038;
        if (targetUnit === 'atm') return psiVal / 14.6959;
        if (targetUnit === 'kPa') return psiVal / 0.145038;
        return psiVal; // if psi
      };
      if (fromUnit === toUnit) convertedValue = value;
      else convertedValue = fromPSI(toPSI(value, fromUnit), toUnit);
    } else if (category === 'length') {
        const toMeters = (val: number, unit: string) => {
            if (unit === 'ft') return val * 0.3048;
            if (unit === 'in') return val * 0.0254;
            if (unit === 'km') return val * 1000;
            if (unit === 'mi') return val * 1609.34;
            return val; // if m
        };
        const fromMeters = (meterVal: number, targetUnit: string) => {
            if (targetUnit === 'ft') return meterVal / 0.3048;
            if (targetUnit === 'in') return meterVal / 0.0254;
            if (targetUnit === 'km') return meterVal / 1000;
            if (targetUnit === 'mi') return meterVal / 1609.34;
            return meterVal; // if m
        };
        if (fromUnit === toUnit) convertedValue = value;
        else convertedValue = fromMeters(toMeters(value, fromUnit), toUnit);
    }

    if (convertedValue !== null) {
      setResult(convertedValue.toFixed(3)); // Limit to 3 decimal places
    } else {
      setResult(language === 'ar' ? 'تحويل غير مدعوم' : 'Conversion not supported');
    }
  };

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full p-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";
  const buttonClasses = "py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-150";
  const primaryButtonClasses = `${buttonClasses} bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark hover:opacity-90`;

  return (
    <div className={`${cardClasses} space-y-5`} dir={language}>
      <div>
        <label htmlFor="conversionCategory" className={labelBaseClasses}>{translate('conversionTypeLabel')}</label>
        <select id="conversionCategory" value={category} onChange={e => handleCategoryChange(e.target.value as ConversionCategory)} className={inputBaseClasses}>
          {Object.keys(UNIT_CONVERSION_TYPES).map(catKey => (
            <option key={catKey} value={catKey}>{translate(catKey as any)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fromUnit" className={labelBaseClasses}>{translate('fromUnitLabel')}</label>
          <select id="fromUnit" value={fromUnit} onChange={e => setFromUnit(e.target.value)} className={inputBaseClasses}>
            {UNIT_CONVERSION_TYPES[category].map(unit => (
              <option key={unit.id} value={unit.id}>{translate(unit.nameKey as any)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="toUnit" className={labelBaseClasses}>{translate('toUnitLabel')}</label>
          <select id="toUnit" value={toUnit} onChange={e => setToUnit(e.target.value)} className={inputBaseClasses}>
            {UNIT_CONVERSION_TYPES[category].map(unit => (
              <option key={unit.id} value={unit.id}>{translate(unit.nameKey as any)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="inputValue" className={labelBaseClasses}>{translate('valueToConvertLabel')}</label>
        <input type="number" id="inputValue" value={inputValue} onChange={e => setInputValue(e.target.value)} className={inputBaseClasses} placeholder={language === 'ar' ? 'ادخل القيمة' : 'Enter value'} />
      </div>

      <button onClick={convertValue} className={`${primaryButtonClasses} w-full`}>
        {translate('convertButton')}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md text-center">
          <p className={labelBaseClasses}>{translate('convertedValueLabel')}:</p>
          <p className={`text-xl font-bold text-csp-accent dark:text-csp-accent-dark ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>{result}</p>
        </div>
      )}
    </div>
  );
};

export default UnitConverterPage;