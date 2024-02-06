import React, { createContext, useState, useContext, useEffect } from 'react';
import { localStorageDelete, localStorageGet, localStorageSet } from '../utils/localStorage';

interface StoreContextProps {
  page: number;
  setPage: (value: number) => void;
  miniPage: number;
  setMiniPage: (value: number) => void;
  setCategoryTab: (value: number) => void;
  lastCategoryTab: number;
  lang: string;
  setLang: (value: string) => void;
}

interface propsType {
  children: React.ReactNode;
}

const StoreContext = createContext<StoreContextProps | null>(null);

const StoreProvider = (props: propsType) => {
  const [page, setPage] = useState<number>(localStorageGet('page'));
  const [miniPage, setMiniPage] = useState<number>(localStorageGet('miniPage'));
  const [lastCategoryTab, setLastCategoryTab] = useState<number>(localStorageGet('lastCategoryTab'));
  const [lang, setLang] = useState<string>('English');

  const setLanguage = (language: string) => {
    setLang(language);
    localStorageSet('tigris-language', language);
  };

  const loadPage = () => {
    console.log({ tigrisLang: localStorageGet('tigris-language') });
    setLang(
      localStorageGet('tigris-language') === '' || localStorageGet('tigris-language') === 0
        ? 'English'
        : localStorageGet('tigris-language')
    );
    setPage(localStorageGet('page') === '' ? 0 : localStorageGet('page'));
    setMiniPage(localStorageGet('miniPage') === '' ? 0 : localStorageGet('miniPage'));
    localStorageDelete('wagmi.cache');
  };

  const setPageNumber = (num: number) => {
    setPage(num);
    localStorageSet('page', num);
  };

  const setMiniPageNumber = (num: number) => {
    setMiniPage(num);
    localStorageSet('miniPage', num);
  };

  const setCategoryTab = (value: number) => {
    setLastCategoryTab(value);
    localStorageSet('lastCategoryTab', value);
  };

  useEffect(() => {
    loadPage();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        page,
        setPage: setPageNumber,
        miniPage,
        setMiniPage: setMiniPageNumber,
        setCategoryTab,
        lastCategoryTab,
        lang,
        setLang: setLanguage
      }}
    >
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error("can't find context");
  }
  return context;
};
