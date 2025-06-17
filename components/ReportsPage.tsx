import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { translations } from '../constants'; 
import { Language } from '../types'; 


const mockReportData = [
  { nameKey: 'الوردية 1', en_name: 'Shift Alpha', ar_name: 'وردية ألفا', tasksCompleted: 42, hoursWorked: 185 },
  { nameKey: 'الوردية 2', en_name: 'Shift Bravo', ar_name: 'وردية برافو', tasksCompleted: 38, hoursWorked: 172 },
  { nameKey: 'الوردية 3', en_name: 'Shift Charlie', ar_name: 'وردية تشارلي', tasksCompleted: 47, hoursWorked: 193 },
  { nameKey: 'الوردية 4', en_name: 'Shift Delta', ar_name: 'وردية دلتا', tasksCompleted: 33, hoursWorked: 165 },
];

const ReportsPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const localizedChartData = mockReportData.map(item => ({
    ...item,
    name: language === 'ar' ? item.ar_name : item.en_name,
  }));
  
  const handlePrint = () => {
    window.print();
  };
  
  const primaryChartColor = 'var(--theme-csp-primary)';
  const accentChartColor = 'var(--theme-csp-accent)';
  const gridStrokeColor = isDark ? 'var(--theme-csp-base-dark-300)' : 'var(--theme-csp-base-300)';
  const tickFillColor = isDark ? 'var(--theme-csp-base-dark-content)' : 'var(--theme-csp-base-content)';
  const tooltipBg = isDark ? 'hsla(var(--theme-csp-base-dark-200-hsl), 0.95)' : 'hsla(var(--theme-csp-base-100-hsl), 0.95)';
  const tooltipBorder = isDark ? 'var(--theme-csp-secondary)' : 'var(--theme-csp-base-300)';


  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <button 
            onClick={handlePrint}
            className="w-full py-2.5 px-4 bg-csp-secondary hover:bg-opacity-80 text-white font-semibold rounded-md shadow flex items-center justify-center text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {translate('printReport')}
        </button>
      
      <div className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-xl shadow-lg">
        <h2 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-4 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('teamPerformance')}</h2>
        <div style={{ width: '100%', height: 280 }}> {/* Adjusted height for mobile */}
            <ResponsiveContainer>
                <BarChart data={localizedChartData} margin={{ top: 5, right: language === 'ar' ? 5 : 20, left: language === 'ar' ? 20 : 5, bottom: 5 }} barGap={5}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                    <XAxis dataKey="name" reversed={language === 'ar'} tick={{ fill: tickFillColor, fontSize: 10, fontFamily: language === 'ar' ? 'Tajawal' : 'Poppins' }} />
                    <YAxis reversed={language === 'ar'} yAxisId="left" orientation={language === 'ar' ? 'right' : 'left'} stroke={primaryChartColor} tick={{ fill: tickFillColor, fontSize: 10 }} allowDecimals={false}/>
                    <YAxis yAxisId="right" orientation={language === 'ar' ? 'left' : 'right'} stroke={accentChartColor} tick={{ fill: tickFillColor, fontSize: 10 }} allowDecimals={false}/>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: tooltipBg, 
                            border: `1px solid ${tooltipBorder}`, 
                            borderRadius: '0.5rem', 
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            direction: language === 'ar' ? 'rtl' : 'ltr', 
                            fontFamily: language === 'ar' ? 'Tajawal' : 'Poppins',
                            fontSize: '0.75rem', /* text-xs */
                            padding: '0.5rem' /* p-2 */
                        }} 
                        itemStyle={{color: tickFillColor}}
                        labelStyle={{color: isDark ? 'var(--theme-csp-accent)' : 'var(--theme-csp-primary)', fontWeight: 'bold', marginBottom: '2px', borderBottom: `1px solid ${tooltipBorder}`, paddingBottom: '2px'}}
                    />
                    <Legend wrapperStyle={{fontFamily: language === 'ar' ? 'Tajawal' : 'Poppins', color: tickFillColor, paddingTop: '10px', fontSize: '0.75rem'}} />
                    <Bar yAxisId="left" dataKey="tasksCompleted" fill={primaryChartColor} name={translate('tasksCompleted')} radius={[4, 4, 0, 0]} barSize={15}/>
                    <Bar yAxisId="right" dataKey="hoursWorked" fill={accentChartColor} name={translate('hoursWorked')} radius={[4, 4, 0, 0]} barSize={15}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

       <div className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-xl shadow-lg">
        <h2 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-2 ${language === 'ar' ? 'text-right font-cairo' : 'text-left font-poppins'}`}>{translate('generateReport')}</h2>
        <p className="text-xs text-csp-secondary dark:text-gray-400 mb-3">{translate('generateReportDesc')}</p>
        <button className={`w-full py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-csp-accent text-sm`}>
            {translate('downloadPdfReport')}
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;