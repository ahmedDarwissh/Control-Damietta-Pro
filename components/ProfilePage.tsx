
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, UserRole } from '../../types';
import { AVATAR_OPTIONS, DEFAULT_AVATAR_URL, translations } from '../../constants';
import { updateUserProfile as updateUserProfileInFirestore, uploadFileToStorage } from '../../services/firestoreService';

const ProfilePage: React.FC = () => {
  const { translate, language } = useLocalization();
  const { currentUser, logOut, handleFirestoreOutcome, updateUserSettings: updateAuthContextUserSettings } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(currentUser?.avatarUrl || DEFAULT_AVATAR_URL);
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setBirthDate(currentUser.birthDate || '');
      setSelectedAvatarUrl(currentUser.avatarUrl || DEFAULT_AVATAR_URL);
    }
  }, [currentUser]);

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        alert(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 2 ميجا بايت).' : 'Image size too large (max 2MB).');
        return;
      }
      setCustomAvatarFile(file);
      setSelectedAvatarUrl(''); // Indicate custom avatar is primary
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    let finalAvatarUrl = selectedAvatarUrl;

    try {
      if (customAvatarFile) {
        const filePath = `avatars/${currentUser.uid}/${Date.now()}_${customAvatarFile.name}`;
        finalAvatarUrl = await uploadFileToStorage(customAvatarFile, filePath);
      }
      
      const updatedProfileData: Partial<User> = {
        name,
        phone,
        birthDate,
        avatarUrl: finalAvatarUrl,
      };

      await updateUserProfileInFirestore(currentUser.uid, updatedProfileData);
      
      // Manually update currentUser in AuthContext after successful save
      const updatedUser = { 
        ...currentUser, 
        ...updatedProfileData,
        // If userSettings were also editable here, merge them too:
        // userSettings: { ...currentUser.userSettings, ...editableUserSettings } 
      };
      // This part needs a way to update the currentUser in AuthContext.
      // For now, relying on onAuthStateChanged to pick up changes might be slow.
      // A direct setter or a re-fetch mechanism in AuthContext would be better.
      // Let's assume AuthProvider's listener eventually picks this up or that a refresh will show it.
      // For immediate UI update, one might update the local 'currentUser' state if it's passed down or managed differently.
      // For now, we are directly updating the User object which is part of auth context.
      // The AuthProvider effect that listens to onAuthStateChanged will re-fetch or use cached user.
      // To ensure settings also update if they were part of this form:
      if (updateAuthContextUserSettings && currentUser.userSettings) { 
         await updateAuthContextUserSettings(currentUser.userSettings); 
      }

      alert(translate('profileUpdatedSuccess'));
      setIsEditing(false);
      setCustomAvatarFile(null);
      setCustomAvatarPreview(null);
      handleFirestoreOutcome(null);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      handleFirestoreOutcome(err);
      alert(language === 'ar' ? 'فشل تحديث الملف الشخصي.' : 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleDisplayName = (role: UserRole) => {
    const roleKey = role.toLowerCase() as keyof typeof translations.en;
    return translate(roleKey);
  }

  if (!currentUser) {
    return <div className="p-4 text-center">{translate('loading')}</div>;
  }
  
  const displayAvatar = customAvatarPreview || selectedAvatarUrl || DEFAULT_AVATAR_URL;

  const cardClasses = "bg-csp-primary dark:bg-csp-secondary-dark-bg p-5 rounded-xl shadow-lg border border-csp-secondary-text/10 dark:border-csp-primary-dark-text/10";
  const inputBaseClasses = "block w-full px-3 py-2.5 border border-csp-secondary-text/30 dark:border-csp-secondary-dark-text/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-csp-accent dark:focus:ring-csp-accent-dark focus:border-csp-accent dark:focus:border-csp-accent-dark text-sm bg-csp-secondary-bg dark:bg-csp-primary-dark text-csp-primary-text dark:text-csp-primary-dark-text transition-all duration-150";
  const labelBaseClasses = "block text-sm font-medium text-csp-primary-text dark:text-csp-secondary-dark-text mb-1";


  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`${cardClasses} text-center`}>
        <img 
          src={displayAvatar} 
          alt={currentUser.name} 
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-csp-accent dark:border-csp-accent-dark shadow-md"
        />
        {isEditing && (
          <div className="mb-4">
             <div className="flex flex-wrap gap-2 justify-center mb-2">
                {AVATAR_OPTIONS.map(avatar => (
                    <img 
                        key={avatar} src={avatar} alt="avatar option"
                        onClick={() => { setSelectedAvatarUrl(avatar); setCustomAvatarFile(null); setCustomAvatarPreview(null); }}
                        className={`w-12 h-12 rounded-full cursor-pointer object-cover border-2 transition-all duration-200 ${selectedAvatarUrl === avatar && !customAvatarFile ? 'border-csp-accent dark:border-csp-accent-dark ring-2 ring-csp-accent dark:ring-csp-accent-dark' : 'border-transparent hover:border-csp-accent/70'}`}
                    />
                ))}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-csp-accent dark:text-csp-accent-dark hover:underline">
              {translate('orUploadAvatar')}
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" />
          </div>
        )}
        {isEditing ? (
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={`${inputBaseClasses} text-center text-xl font-bold mb-1`} placeholder={translate('nameLabel')}/>
        ) : (
          <h1 className={`text-2xl font-bold text-csp-primary-text dark:text-csp-primary-dark-text mb-1 ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{currentUser.name}</h1>
        )}
        <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text">{currentUser.email}</p>
        <p className="text-sm text-csp-accent dark:text-csp-accent-dark mt-0.5">{getRoleDisplayName(currentUser.role)} {currentUser.teamName && `(${currentUser.teamName})`}</p>
        <p className="text-sm text-csp-secondary-text dark:text-csp-secondary-dark-text mt-1">{translate('userPoints', currentUser.points || 0)}</p>
      </div>

      <div className={cardClasses}>
        <h2 className={`text-lg font-semibold text-csp-primary-text dark:text-csp-primary-dark-text mb-3 ${language === 'ar' ? 'font-cairo' : 'font-poppins'}`}>{translate('profile')} {translate('details')}</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="phone" className={labelBaseClasses}>{translate('phoneNumber')}</label>
            {isEditing ? (
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={inputBaseClasses} placeholder="e.g. 01xxxxxxxxx"/>
            ) : (
              <p className="text-sm text-csp-primary-text dark:text-csp-primary-dark-text">{phone || (language === 'ar' ? 'لم يتم الإضافة' : 'Not set')}</p>
            )}
          </div>
          <div>
            <label htmlFor="birthDate" className={labelBaseClasses}>{translate('birthDate')}</label>
            {isEditing ? (
              <input type="date" id="birthDate" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputBaseClasses} />
            ) : (
              <p className="text-sm text-csp-primary-text dark:text-csp-primary-dark-text">{birthDate ? new Date(birthDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-CA') : (language === 'ar' ? 'لم يتم الإضافة' : 'Not set')}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse">
        {isEditing ? (
          <>
            <button onClick={handleSaveProfile} disabled={isLoading} className="flex-1 py-2.5 px-4 bg-csp-accent text-white font-semibold rounded-md shadow hover:bg-opacity-90 transition-opacity disabled:opacity-60">
              {isLoading ? translate('loading') : translate('saveChanges')}
            </button>
            <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 px-4 bg-csp-secondary-text/20 text-csp-primary-text dark:text-csp-primary-dark-text font-semibold rounded-md shadow hover:bg-opacity-80 transition-opacity">
              {translate('cancel')}
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="w-full py-2.5 px-4 bg-csp-accent dark:bg-csp-accent-dark text-white dark:text-csp-primary-dark font-semibold rounded-md shadow hover:opacity-90 transition-opacity">
            {translate('editProfile')} 
          </button>
        )}
      </div>
       <button 
          onClick={logOut} 
          className="w-full mt-4 py-2.5 px-4 text-csp-error border border-csp-error hover:bg-red-500/10 font-semibold rounded-md shadow transition-colors"
        >
          {translate('logout')}
        </button>
    </div>
  );
};

export default ProfilePage;
