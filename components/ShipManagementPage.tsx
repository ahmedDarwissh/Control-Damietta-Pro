import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { ShipInfo, ShipStatus, CargoType } from '../types'; 
import ShipInfoCard from './ShipInfoCard';
import { getAllShips, addShipToFirestore } from '../services/firestoreService';

const ShipManagementPage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { handleFirestoreOutcome, error: globalAuthError, isFirestoreOffline } = useAuth();
  const [ships, setShips] = useState<ShipInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShipName, setNewShipName] = useState('');
  const [newShipStatus, setNewShipStatus] = useState<ShipStatus>(ShipStatus.IMPORT);
  const [newShipCargo, setNewShipCargo] = useState<CargoType>(CargoType.LPG);
  const [newShipEta, setNewShipEta] = useState('');
  const [newShipEtd, setNewShipEtd] = useState('');
  const [newShipQuantity, setNewShipQuantity] = useState<number | ''>('');
  const [newShipRate, setNewShipRate] = useState<number | ''>('');


  useEffect(() => {
    const fetchShips = async () => {
      setIsLoading(true);
      try {
        const fetchedShips = await getAllShips();
        setShips(fetchedShips);
        handleFirestoreOutcome(null);
      } catch (err) {
        console.error("Error fetching ships:", err);
        handleFirestoreOutcome(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShips();
  }, [language, handleFirestoreOutcome]);

  const handleAddShip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipName.trim()) {
        alert(language === 'ar' ? 'اسم السفينة مطلوب.' : 'Ship name is required.');
        return;
    }
    if (isFirestoreOffline) {
        alert(language === 'ar' ? 'أنت غير متصل حالياً. لا يمكن إضافة سفينة.' : 'You are currently offline. Cannot add ship.');
        return;
    }
    const newShipData: Omit<ShipInfo, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newShipName,
        status: newShipStatus,
        cargoType: newShipCargo,
        eta: newShipEta || undefined,
        etd: newShipEtd || undefined,
        currentQuantity: newShipQuantity === '' ? undefined : Number(newShipQuantity),
        hourlyRate: newShipRate === '' ? undefined : Number(newShipRate),
    };
    
    try {
      const addedShip = await addShipToFirestore(newShipData);
      setShips(prev => [addedShip, ...prev]);
      handleFirestoreOutcome(null);
      setNewShipName('');
      setNewShipStatus(ShipStatus.IMPORT);
      setNewShipCargo(CargoType.LPG);
      setNewShipEta('');
      setNewShipEtd('');
      setNewShipQuantity('');
      setNewShipRate('');
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding ship:", err);
      handleFirestoreOutcome(err);
      alert(language === 'ar' ? 'فشل إضافة السفينة.' : 'Failed to add ship.');
    }
  };


  if (isLoading && !globalAuthError) {
    return <div className="p-4 text-center text-csp-secondary dark:text-csp-base-dark-content">{translate('loading')}</div>;
  }

  const inputBaseClasses = "block w-full p-2.5 border border-csp-base-300 dark:border-csp-base-dark-300 bg-csp-base-100 dark:bg-csp-base-dark-300 text-csp-base-content dark:text-csp-base-dark-content rounded-md shadow-sm focus:ring-1 focus:ring-csp-accent focus:border-csp-accent text-sm transition-shadow";
  const labelBaseClasses = "block text-xs font-medium text-csp-base-content dark:text-csp-base-dark-content mb-1";


  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        {/* Title now handled by main Header */}
        <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 flex items-center justify-center text-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {translate(showAddForm ? 'cancel' : 'addNewShip')}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleAddShip} className="bg-csp-base-100 dark:bg-csp-base-dark-200 p-4 rounded-xl shadow-lg space-y-3">
            <h2 className={`text-lg font-semibold text-csp-primary dark:text-csp-accent mb-3 ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{translate('addNewShip')}</h2>
            
            <div>
                <label htmlFor="shipName" className={labelBaseClasses}>{translate('shipName')}</label>
                <input type="text" id="shipName" value={newShipName} onChange={e => setNewShipName(e.target.value)} required className={inputBaseClasses}/>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="shipStatus" className={labelBaseClasses}>{translate('shipStatus')}</label>
                    <select id="shipStatus" value={newShipStatus} onChange={e => setNewShipStatus(e.target.value as ShipStatus)} className={inputBaseClasses}>
                        <option value={ShipStatus.IMPORT}>{translate('import')}</option>
                        <option value={ShipStatus.EXPORT}>{translate('export')}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="cargoType" className={labelBaseClasses}>{translate('cargoType')}</label>
                    <select id="cargoType" value={newShipCargo} onChange={e => setNewShipCargo(e.target.value as CargoType)} className={inputBaseClasses}>
                        <option value={CargoType.LPG}>{translate('lpg')}</option>
                        <option value={CargoType.LNG}>{translate('lng')}</option>
                        <option value={CargoType.PROPANE}>{translate('propane')}</option>
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="shipEta" className={labelBaseClasses}>{translate('eta')} <span className="text-gray-400 text-xs">(YYYY-MM-DD HH:MM)</span></label>
                    <input type="text" id="shipEta" placeholder="e.g., 2024-08-15 14:30" value={newShipEta} onChange={e => setNewShipEta(e.target.value)} className={inputBaseClasses}/>
                </div>
                <div>
                    <label htmlFor="shipEtd" className={labelBaseClasses}>{translate('etd')} <span className="text-gray-400 text-xs">(YYYY-MM-DD HH:MM)</span></label>
                    <input type="text" id="shipEtd" placeholder="e.g., 2024-08-16 10:00" value={newShipEtd} onChange={e => setNewShipEtd(e.target.value)} className={inputBaseClasses}/>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label htmlFor="shipQuantity" className={labelBaseClasses}>{translate('quantity')}</label>
                    <input type="number" id="shipQuantity" value={newShipQuantity} onChange={e => setNewShipQuantity(e.target.value === '' ? '' : Number(e.target.value))} className={inputBaseClasses}/>
                </div>
                 <div>
                    <label htmlFor="shipRate" className={labelBaseClasses}>{translate('rate')}</label>
                    <input type="number" id="shipRate" value={newShipRate} onChange={e => setNewShipRate(e.target.value === '' ? '' : Number(e.target.value))} className={inputBaseClasses}/>
                </div>
            </div>
            
            <button 
                type="submit" 
                disabled={isFirestoreOffline}
                className="w-full py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-csp-accent disabled:opacity-60 disabled:cursor-not-allowed text-sm">
                {translate('addShip')}
            </button>
        </form> 
      )}

      <section className="bg-transparent p-0">
        {(!isLoading || ships.length > 0) && !globalAuthError && ships.length > 0 ? (
          <div className="space-y-4"> {/* Ships stack vertically */}
            {ships.map(ship => <ShipInfoCard key={ship.id} ship={ship} />)}
          </div>
        ) : (
          !globalAuthError && (
            <div className={`text-sm text-csp-secondary dark:text-gray-400 p-4 bg-csp-base-100 dark:bg-csp-base-dark-200 rounded-xl shadow text-center ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <p>{translate('noShipsData')}</p>
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default ShipManagementPage;