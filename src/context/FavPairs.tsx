import { useState, createContext } from 'react';

export const FavPairsContext = createContext({
  favPairs: ["BTC/USD", "ETH/USD"],
  // eslint-disable-next-line
  changeFavPair: (name: string, setFav: boolean) => {console.log("Clicked dummy function")}
});

export const FavPairsProvider = (props: any) => {
  const [favPairs, setFavPairs] = useState<string[]>(
    JSON.parse(
      localStorage.getItem('FavPairs') === null
        ? '["BTC/USD", "ETH/USD"]'
        : (localStorage.getItem('FavPairs') as string)
    ) as string[]
  );

  function changeFavPair(name: string, setFav: boolean) {
    const newFavPairs = setFav ? [...favPairs, name] : favPairs.filter(pair => pair !== name);
    setFavPairs(newFavPairs);
    localStorage.setItem('FavPairs', JSON.stringify(newFavPairs));
  }

  return (
    <FavPairsContext.Provider
      value={{ favPairs: favPairs, changeFavPair: changeFavPair }}
    >
      {props.children}
    </FavPairsContext.Provider>
  );
};