import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const ShopContext = createContext(null);

/** Të dhëna globale të dyqanit: cilësimet dhe kategoritë (për menunë, footer-in etj.) */
export function ShopProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);

  const refreshCategories = useCallback(() => api.getCategories().then(setCategories).catch(() => {}), []);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
    refreshCategories();
  }, [refreshCategories]);

  return (
    <ShopContext.Provider value={{ settings, categories, refreshCategories }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
