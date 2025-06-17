import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAppConfig } from '../contexts/AppConfigContext'; // To get Quran radio URL
import AudioPlayer from './AudioPlayer';
import { QURAN_RADIO_STREAM_URL } from '../constants'; // Fallback
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const RadioIconSvg: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-7 h-7"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-csp-accent dark:text-csp-accent-dark"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25a4.5 4.5 0 00-3.09 3.09L12 18.75l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 21l2.846.813a4.5 4.5 0 003.09-3.09L21.75 18l-.813-2.846a4.5 4.5 0 00-3.09-3.09zM12 2.25l.813 2.846a4.5 4.5 0 003.09 3.09L18.75 9l-2.846.813a4.5 4.5 0 00-3.09 3.09L12 15.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L5.25 9l2.846-.813a4.5 4.5 0 003.09-3.09L12 2.25z" /></svg>;

const sectionCardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 sm:p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
const sectionTitleClasses = (lang: string) => `text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${lang === 'ar' ? 'font-cairo' : 'font-poppins'}`;


const EntertainmentPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { appConfig } = useAppConfig();
  const [aiJoke, setAiJoke] = useState<string>(translate('aiWisdomPlaceholder'));
  const [aiRiddle, setAiRiddle] = useState<{ question: string, answer?: string }>({ question: translate('aiRiddlePlaceholder') });
  const [loadingAiContent, setLoadingAiContent] = useState(true);
  const [showRiddleAnswer, setShowRiddleAnswer] = useState(false);

  const quranRadioUrl = appConfig?.quranRadioUrl || QURAN_RADIO_STREAM_URL;

  useEffect(() => {
    const fetchAiContent = async () => {
      if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
        console.warn("Gemini API key not configured. AI content will be placeholder.");
        setAiJoke("AI Joke: Why don't scientists trust atoms? Because they make up everything! (Configure API_KEY for real jokes)");
        setAiRiddle({question: "AI Riddle: I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I? (Configure API_KEY for real riddles)", answer: "A map"});
        setLoadingAiContent(false);
        return;
      }
      setLoadingAiContent(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Fetch Joke
        const jokePrompt = language === 'ar' 
          ? "احكي نكتة قصيرة ومضحكة باللهجة المصرية مناسبة لبيئة عمل" 
          : "Tell a short, funny, work-appropriate joke in English.";
        const jokeResponse: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: jokePrompt,
        });
        setAiJoke(jokeResponse.text || "Failed to fetch joke.");

        // Fetch Riddle
        const riddlePrompt = language === 'ar' 
          ? "اعطيني لغز عام ومسلي مع اجابته باللهجة المصرية. افصل السؤال عن الإجابة بكلمة 'الإجابة:'" 
          : "Give me a general, fun riddle with its answer. Separate the question from the answer with 'Answer:'";
        const riddleResponse: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: riddlePrompt,
        });
        const riddleText = riddleResponse.text;
        if (riddleText) {
          const parts = riddleText.split(language === 'ar' ? 'الإجابة:' : 'Answer:');
          setAiRiddle({ question: parts[0].trim(), answer: parts[1]?.trim() });
        } else {
          setAiRiddle({ question: "Failed to fetch riddle." });
        }

      } catch (error) {
        console.error("Error fetching AI content:", error);
        setAiJoke(language === 'ar' ? "الذكاء الاصطناعي شكله واخد اجازة النهاردة... حاول تاني بعدين!" : "AI seems to be on a break... try again later!");
        setAiRiddle({ question: language === 'ar' ? "مفيش فوازير من الذكاء الاصطناعي دلوقتي." : "No riddles from AI right now."});
      } finally {
        setLoadingAiContent(false);
      }
    };

    fetchAiContent();
  }, [language, translate]);


  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <section className={sectionCardClasses}>
        <div className="flex items-center mb-4">
            <RadioIconSvg className={`w-7 h-7 ${language === 'ar' ? 'ml-3' : 'mr-3'} text-csp-accent dark:text-csp-accent-dark`} />
            <h2 className={sectionTitleClasses(language)}>
            {translate('quranRadio')}
            </h2>
        </div>
        <AudioPlayer streamUrl={quranRadioUrl} />
        <p className="text-xs text-csp-secondary-text dark:text-csp-secondary-dark-text mt-3 text-center">
          {language === 'ar' ? 'إذاعة القرآن الكريم من القاهرة - بث مباشر.' : 'Holy Quran Radio from Cairo - Live Stream.'}
        </p>
      </section>

      <section className={sectionCardClasses}>
        <div className="flex items-center mb-3">
          <SparklesIcon />
          <h2 className={`${sectionTitleClasses(language)} ml-2 rtl:mr-2 rtl:ml-0`}>
            {language === 'ar' ? 'نكتة اليوم (AI)': 'Joke of the Day (AI)'}
          </h2>
        </div>
        <p className="text-csp-primary-text dark:text-csp-primary-dark-text italic text-sm min-h-[4em]">
          {loadingAiContent ? translate('loading') : aiJoke}
        </p>
      </section>
      
      <section className={sectionCardClasses}>
        <div className="flex items-center mb-3">
          <SparklesIcon />
          <h2 className={`${sectionTitleClasses(language)} ml-2 rtl:mr-2 rtl:ml-0`}>
            {language === 'ar' ? 'فزورة اليوم (AI)': 'Riddle of the Day (AI)'}
          </h2>
        </div>
        <p className="text-csp-primary-text dark:text-csp-primary-dark-text italic text-sm min-h-[3em]">
          {loadingAiContent ? translate('loading') : aiRiddle.question}
        </p>
        {aiRiddle.answer && !loadingAiContent && (
            <button 
                onClick={() => setShowRiddleAnswer(!showRiddleAnswer)}
                className="mt-3 text-xs text-csp-accent dark:text-csp-accent-dark hover:underline focus:outline-none"
            >
                {showRiddleAnswer ? (language === 'ar' ? 'إخفاء الإجابة' : 'Hide Answer') : (language === 'ar' ? 'عرض الإجابة' : 'Show Answer')}
            </button>
        )}
        {showRiddleAnswer && aiRiddle.answer && (
            <p className="mt-2 text-sm text-csp-primary-text dark:text-csp-primary-dark-text font-semibold p-2 bg-csp-secondary-bg dark:bg-csp-primary-dark rounded-md">
                {aiRiddle.answer}
            </p>
        )}
      </section>
    </div>
  );
};

export default EntertainmentPage;
