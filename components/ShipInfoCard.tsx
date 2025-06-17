import React from 'react';
import { ShipInfo, ShipStatus, CargoType } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface ShipInfoCardProps {
  ship: ShipInfo;
}

const ShipIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 text-white"}>
    <path d="M2 2.5A.5.5 0 012.5 2H6V1.5a.5.5 0 011 0V2h4l.564-.94A.5.5 0 0112 1h.5a.5.5 0 01.316.117L14.5 3h1.353a.5.5 0 01.408.216l1.5 2.5A.5.5 0 0117.5 6H20v1.5a.5.5 0 01-1 0V6h-2.5a.5.5 0 01-.408-.216l-1.5-2.5A.5.5 0 0114.353 3H12.5l-1.684 2.806A.5.5 0 0110.5 6H6V5L3.5 2.5A.5.5 0 012 2.5zM12 10.155L6.096 7.429A.5.5 0 005.5 7.848v10.517a.5.5 0 00.281.455l6 3.064a.5.5 0 00.438 0l6-3.064a.5.5 0 00.281-.455V7.848a.5.5 0 00-.596-.419L12 10.155z"/>
  </svg>
);

const PumpStatusIndicator: React.FC<{ status?: 'Operational' | 'Offline' | 'Maintenance'}> = ({status}) => {
    let color = 'bg-gray-400';
    if (status === 'Operational') color = 'bg-csp-success';
    else if (status === 'Offline') color = 'bg-csp-error';
    else if (status === 'Maintenance') color = 'bg-csp-warning text-csp-primary';
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} mr-1.5 rtl:ml-1.5 rtl:mr-0 shadow-sm`}></span>;
}

const ShipInfoCard: React.FC<ShipInfoCardProps> = ({ ship }) => {
  const { translate, language } = useLocalization();

  const getStatusColor = (status: ShipStatus) => {
    return status === ShipStatus.IMPORT 
        ? 'bg-csp-info/20 text-csp-info dark:bg-csp-info/30 dark:text-blue-300' 
        : 'bg-csp-success/20 text-csp-success dark:bg-csp-success/30 dark:text-green-300';
  };

  const getCargoText = (cargo: CargoType) => {
    switch(cargo) {
        case CargoType.LPG: return translate('lpg');
        case CargoType.LNG: return translate('lng');
        case CargoType.PROPANE: return translate('propane');
        default: return cargo;
    }
  }

  const getShipStatusText = (status: ShipStatus) => {
    return status === ShipStatus.IMPORT ? translate('import') : translate('export');
  }

  const getPumpStatusText = (status: 'Operational' | 'Offline' | 'Maintenance' | undefined) => {
    if (!status) return 'N/A';
    if (status === 'Operational') return translate('operational');
    if (status === 'Offline') return translate('offline');
    if (status === 'Maintenance') return translate('maintenance');
    return status;
  }

  return (
    <div className={`bg-csp-base-100 dark:bg-csp-base-dark-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`p-4 bg-gradient-to-r from-csp-primary to-csp-secondary text-white flex items-center`}>
        <ShipIcon />
        <h3 className={`text-lg font-bold truncate ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{ship.name}</h3>
      </div>
      <div className="p-4 space-y-2.5 text-xs"> {/* Adjusted padding and spacing, smaller base text */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('shipStatus')}:</span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(ship.status)}`}>
            {getShipStatusText(ship.status)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('cargoType')}:</span>
          <span className={`font-semibold text-csp-primary dark:text-csp-base-dark-content`}>{getCargoText(ship.cargoType)}</span>
        </div>
        {ship.eta && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('eta')}:</span>
            <span className="text-csp-base-content dark:text-csp-base-dark-content">{ship.eta}</span>
          </div>
        )}
        {ship.etd && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('etd')}:</span>
            <span className="text-csp-base-content dark:text-csp-base-dark-content">{ship.etd}</span>
          </div>
        )}
         {ship.currentQuantity !== undefined && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('quantity')}:</span>
            <span className="text-csp-base-content dark:text-csp-base-dark-content">{ship.currentQuantity} {ship.cargoType === CargoType.LPG || ship.cargoType === CargoType.PROPANE ? 'MT' : 'm³'}</span>
          </div>
        )}
        {ship.hourlyRate !== undefined && (
          <div className="flex justify-between items-center">
            <span className="font-medium text-csp-secondary dark:text-gray-400">{translate('rate')}:</span>
            <span className="text-csp-base-content dark:text-csp-base-dark-content">{ship.hourlyRate} {(ship.cargoType === CargoType.LPG || ship.cargoType === CargoType.PROPANE ? 'MT' : 'm³')}/hr</span>
          </div>
        )}
        {ship.pumpStatus && Object.keys(ship.pumpStatus).length > 0 && (
            <div className="pt-1.5">
                <h4 className="font-medium text-csp-secondary dark:text-gray-400 mb-1.5">{translate('pumpStatus')}:</h4>
                <ul className="space-y-1">
                    {Object.entries(ship.pumpStatus).map(([pumpName, pumpValStatus]) => (
                        <li key={pumpName} className="flex items-center justify-between text-csp-base-content dark:text-csp-base-dark-content">
                           <span className="flex items-center"> <PumpStatusIndicator status={pumpValStatus}/> {pumpName === '700-P-01A' ? translate('pumpA') : pumpName === '700-P-01B' ? translate('pumpB') : pumpName === '700-P-01C' ? translate('pumpC') : pumpName}</span>
                           <span>{getPumpStatusText(pumpValStatus)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <button className={`mt-3 w-full bg-csp-accent text-white font-semibold py-2 px-3 rounded-md hover:bg-csp-accent-focus transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-csp-accent-focus focus:ring-opacity-50 shadow-sm text-sm`}>
          {translate('viewDetails')}
        </button>
      </div>
    </div>
  );
};

export default ShipInfoCard;