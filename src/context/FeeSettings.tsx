import { useState, createContext, useEffect } from 'react';
import { localStorageGet, localStorageSet } from '../utils/localStorage';
import { useTranslation } from 'react-i18next';

export const FeeSettingsContext = createContext({
  showOpening: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowOpening: (value: string) => {},
  showClosing: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowClosing: (value: string) => {}
});

export const FeeSettingsProvider = (props: any) => {
  const { t } = useTranslation();
  const [showOpening, setShowOpening] = useState('');
  const [showClosing, setShowClosing] = useState('');

  useEffect(() => {
    setShowOpening(t('After opening fees'));
    setShowClosing(t('After closing fees'));
  }, [t]);

  useEffect(() => {
    localStorageSet('showOpening', showOpening);
    localStorageSet('showClosing', showClosing);
  }, [showOpening, showClosing]);

  return (
    <FeeSettingsContext.Provider
      value={{
        showOpening: showOpening,
        setShowOpening: setShowOpening,
        showClosing: showClosing,
        setShowClosing: setShowClosing
      }}
    >
      {props.children}
    </FeeSettingsContext.Provider>
  );
};
