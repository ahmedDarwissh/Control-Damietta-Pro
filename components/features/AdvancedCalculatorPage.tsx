
import React, { useState } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';

const AdvancedCalculatorPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    // setHistory([]); // Optionally clear history too
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false); // Allow new input after CE
  };
  
  const backspace = () => {
    if (display.length > 1) {
        setDisplay(display.slice(0, -1));
    } else {
        setDisplay('0');
    }
  };

  const performOperation = (nextOperator: string | null) => {
    const inputValue = parseFloat(display);
    let newHistoryEntry = `${currentValue ?? ''} ${operator || ''} ${inputValue} = `;

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = calculate(currentValue, inputValue, operator);
      setDisplay(String(result));
      setCurrentValue(result);
      newHistoryEntry += String(result);
      setHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]); // Keep last 10
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (prevValue: number, nextValue: number, op: string): number => {
    switch (op) {
      case '+': return prevValue + nextValue;
      case '-': return prevValue - nextValue;
      case '*': return prevValue * nextValue;
      case '/': return nextValue === 0 ? NaN : prevValue / nextValue; // Handle division by zero
      case '^': return Math.pow(prevValue, nextValue);
      default: return nextValue;
    }
  };
  
  const handleUnaryOperation = (operation: (val: number) => number, opSymbol: string) => {
    const currentValueFloat = parseFloat(display);
    if (isNaN(currentValueFloat)) return;
    const result = operation(currentValueFloat);
    setHistory(prev => [`${opSymbol}(${currentValueFloat}) = ${result}`, ...prev.slice(0, 9)]);
    setDisplay(String(result));
    // setWaitingForOperand(true); // Decide if this should prepare for a new number or continue op
  };


  const buttonClass = "bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text hover:bg-csp-secondary-text/20 dark:hover:bg-csp-secondary-dark-text/20 p-3 rounded-lg text-lg font-medium transition-colors shadow-sm active:shadow-inner";
  const operatorButtonClass = "bg-csp-accent/80 dark:bg-csp-accent-dark/80 text-white hover:bg-csp-accent dark:hover:bg-csp-accent-dark p-3 rounded-lg text-lg font-medium transition-colors shadow-sm active:shadow-inner";
  const specialButtonClass = "bg-csp-secondary-text/50 dark:bg-csp-secondary-dark-text/50 text-white hover:bg-csp-secondary-text/70 dark:hover:bg-csp-secondary-dark-text/70 p-3 rounded-lg text-lg font-medium transition-colors shadow-sm active:shadow-inner";


  const CalculatorButton: React.FC<{label: string, onClick: () => void, className?: string, labelKey?: string}> = ({label, onClick, className, labelKey}) => (
    <button onClick={onClick} className={`${className || buttonClass} focus:outline-none focus:ring-2 ring-csp-accent dark:ring-csp-accent-dark`}>
        {labelKey ? translate(labelKey as any) : label}
    </button>
  );


  return (
    <div className="bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-2xl max-w-sm mx-auto" dir="ltr"> {/* Force LTR for calculator layout */}
      <div className="bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text p-4 rounded-lg mb-4 text-3xl text-right font-mono shadow-inner break-all h-20 overflow-y-auto">
        {display}
      </div>
      <div className="grid grid-cols-5 gap-2"> {/* Adjusted for 5 columns */}
        {/* Row 1 */}
        <CalculatorButton label="MC" onClick={() => {setMemory(0); setHistory(prev => [`Memory Cleared`, ...prev.slice(0,9)]);}} className={specialButtonClass} labelKey="memoryClear"/>
        <CalculatorButton label="MR" onClick={() => setDisplay(String(memory))} className={specialButtonClass} labelKey="memoryRecall"/>
        <CalculatorButton label="MS" onClick={() => setMemory(parseFloat(display))} className={specialButtonClass} labelKey="memoryStore"/>
        <CalculatorButton label="M+" onClick={() => setMemory(prev => prev + parseFloat(display))} className={specialButtonClass} labelKey="memoryPlus"/>
        <CalculatorButton label="M-" onClick={() => setMemory(prev => prev - parseFloat(display))} className={specialButtonClass} labelKey="memoryMinus"/>

        {/* Row 2 */}
        <CalculatorButton label="sin" onClick={() => handleUnaryOperation(Math.sin, 'sin')} className={specialButtonClass} labelKey="sine"/>
        <CalculatorButton label="cos" onClick={() => handleUnaryOperation(Math.cos, 'cos')} className={specialButtonClass} labelKey="cosine"/>
        <CalculatorButton label="tan" onClick={() => handleUnaryOperation(Math.tan, 'tan')} className={specialButtonClass} labelKey="tangent"/>
        <CalculatorButton label="log" onClick={() => handleUnaryOperation(Math.log10, 'log')} className={specialButtonClass} labelKey="logarithm"/>
        <CalculatorButton label="√" onClick={() => handleUnaryOperation(Math.sqrt, 'sqrt')} className={specialButtonClass} labelKey="squareRoot"/>
        
        {/* Row 3 */}
        <CalculatorButton label="π" onClick={() => {setDisplay(String(Math.PI)); setWaitingForOperand(false);}} className={specialButtonClass} labelKey="piConstant"/>
        <CalculatorButton label="xʸ" onClick={() => performOperation('^')} className={operatorButtonClass} labelKey="exponentiation"/>
        <CalculatorButton label="C" onClick={clearAll} className={specialButtonClass} labelKey="clearAll"/>
        <CalculatorButton label="CE" onClick={clearEntry} className={specialButtonClass} labelKey="clearEntry"/>
        <CalculatorButton label="⌫" onClick={backspace} className={specialButtonClass} labelKey="backspace"/>


        {/* Row 4 */}
        <CalculatorButton label="7" onClick={() => inputDigit('7')} />
        <CalculatorButton label="8" onClick={() => inputDigit('8')} />
        <CalculatorButton label="9" onClick={() => inputDigit('9')} />
        <CalculatorButton label="÷" onClick={() => performOperation('/')} className={operatorButtonClass} />
        <CalculatorButton label="(" onClick={() => {}} className={operatorButtonClass} /> {/* Placeholder */}


        {/* Row 5 */}
        <CalculatorButton label="4" onClick={() => inputDigit('4')} />
        <CalculatorButton label="5" onClick={() => inputDigit('5')} />
        <CalculatorButton label="6" onClick={() => inputDigit('6')} />
        <CalculatorButton label="×" onClick={() => performOperation('*')} className={operatorButtonClass} />
        <CalculatorButton label=")" onClick={() => {}} className={operatorButtonClass} /> {/* Placeholder */}

        {/* Row 6 */}
        <CalculatorButton label="1" onClick={() => inputDigit('1')} />
        <CalculatorButton label="2" onClick={() => inputDigit('2')} />
        <CalculatorButton label="3" onClick={() => inputDigit('3')} />
        <CalculatorButton label="-" onClick={() => performOperation('-')} className={operatorButtonClass} />
        <CalculatorButton label="=" onClick={() => performOperation(null)} className={`${operatorButtonClass} col-span-1 row-span-2 h-full`} /> {/* Spans 2 rows */}


        {/* Row 7 */}
        <CalculatorButton label="0" onClick={() => inputDigit('0')} className={`${buttonClass} col-span-2`} />
        <CalculatorButton label="." onClick={inputDecimal} />
        <CalculatorButton label="+" onClick={() => performOperation('+')} className={operatorButtonClass} />
        {/* Equals button already placed */}
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-csp-secondary-text dark:text-csp-secondary-dark-text mb-1">{language === 'ar' ? 'السجل:' : 'History:'}</h4>
        <div className="bg-csp-secondary-bg dark:bg-csp-primary-dark p-2 rounded-md h-20 overflow-y-auto text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text space-y-1">
            {history.length === 0 && <p className="italic text-gray-400">{language === 'ar' ? 'لا يوجد سجل بعد.' : 'No history yet.'}</p>}
            {history.map((item, index) => <p key={index}>{item}</p>)}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCalculatorPage;
