import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const KEY = 'lulea_cart';

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1 } = action;
      const exists = state.find((i) => i.productId === product.id);
      if (exists) {
        return state.map((i) => (i.productId === product.id ? { ...i, qty: Math.min(i.qty + qty, 50) } : i));
      }
      return [
        ...state,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          accent: product.accent,
          qty,
        },
      ];
    }
    case 'qty':
      return state.map((i) => (i.productId === action.id ? { ...i, qty: Math.max(1, Math.min(action.qty, 50)) } : i));
    case 'remove':
      return state.filter((i) => i.productId !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

const init = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      add: (product, qty) => dispatch({ type: 'add', product, qty }),
      setQty: (id, qty) => dispatch({ type: 'qty', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
