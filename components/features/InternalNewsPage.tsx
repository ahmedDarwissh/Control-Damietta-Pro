
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { InternalNewsArticle } from '../../types';
import { getInternalNewsArticles } from '../../services/firestoreService';
import { INTERNAL_NEWS_CATEGORIES } from '../../constants';

const PinnedBadge: React.FC = () => {
  const { translate, language } = useLocalization();
  return (
    <span className={`ml-2 rtl:mr-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark`}>
      📌 {language === 'ar' ? 'مثبت' : 'Pinned'}
    </span>
  );
};

const InternalNewsPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const [articles, setArticles] = useState<InternalNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<InternalNewsArticle | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await getInternalNewsArticles();
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Error fetching internal news:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-4 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";

  if (isLoading) return <p className="text-center">{translate('loading')}</p>;

  if (selectedArticle) {
    return (
      <div className={`${cardClasses} space-y-3`} dir={language}>
        <button onClick={() => setSelectedArticle(null)} className="text-sm text-csp-accent dark:text-csp-accent-dark hover:underline mb-3">&larr; {translate('back')}</button>
        <h2 className={`text-xl font-bold text-csp-primary-text dark:text-csp-accent-dark ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>
          {selectedArticle.title}
          {selectedArticle.isPinned && <PinnedBadge />}
        </h2>
        {selectedArticle.imageUrl && <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-auto max-h-60 object-cover rounded-md my-2" />}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {translate('newsAuthorLabel')}: {selectedArticle.authorName} | {translate('newsPublishedAtLabel')}: {new Date(selectedArticle.publishedAt.toDate()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}
          {selectedArticle.category && ` | ${translate('newsCategoryLabel')}: ${translate(INTERNAL_NEWS_CATEGORIES.find(c => c.id === selectedArticle.category)?.labelKey as any || selectedArticle.category)}`}
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none text-csp-secondary-text dark:text-csp-secondary-dark-text whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(new RegExp("\\n", "g"), '<br />') }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={language}>
      {articles.length === 0 ? (
        <p className="text-center">{translate('noNewsArticles')}</p>
      ) : (
        articles.map(article => (
          <div key={article.id} className={`${cardClasses} cursor-pointer hover:shadow-xl transition-shadow`} onClick={() => setSelectedArticle(article)}>
            <h3 className={`font-semibold text-csp-primary-text dark:text-csp-primary-dark-text ${language==='ar' ? 'font-cairo' : 'font-poppins'}`}>
              {article.title}
              {article.isPinned && <PinnedBadge />}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              By {article.authorName} - {new Date(article.publishedAt.toDate()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA')}
              {article.category && ` | ${translate(INTERNAL_NEWS_CATEGORIES.find(c => c.id === article.category)?.labelKey as any || article.category)}`}
            </p>
            <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1 truncate">
              {article.content.substring(0, 100)}...
            </p>
            <button className="text-xs text-csp-accent dark:text-csp-accent-dark hover:underline mt-2">{translate('viewArticle')}</button>
          </div>
        ))
      )}
    </div>
  );
};

export default InternalNewsPage;
