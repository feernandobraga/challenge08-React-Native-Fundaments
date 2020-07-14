import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      // setProducts([]);
      const storedProducts = await AsyncStorage.getItem('gotMarketplace:cart');
      // console.log(storedProducts);

      if (storedProducts) {
        setProducts([...JSON.parse(storedProducts)]);
      }

      // const inStorage = await AsyncStorage.getItem('gotMarketplace');
      console.log(JSON.parse(storedProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const isProductInCart = products.find(p => {
        return p.id === product.id;
      });

      // console.log(isProductInCart);

      // eslint-disable-next-line no-extra-boolean-cast
      if (!!isProductInCart) {
        setProducts(
          products.map(p => {
            return p.id === product.id
              ? { ...product, quantity: p.quantity + 1 }
              : p;
          }),
        );
      } else {
        // get the array or products and add a new object to it that has all properties from product
        // and adds one to the property quantity
        setProducts([...products, { ...product, quantity: 1 }]);
        // console.log(products);
      }

      await AsyncStorage.setItem(
        'gotMarketplace:cart',
        JSON.stringify(products),
      );

      const inStorage = await AsyncStorage.getItem('gotMarketplace');
      console.log(JSON.parse(inStorage));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p => {
        return p.id === id ? { ...p, quantity: p.quantity + 1 } : p;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem('gotMarketplace', JSON.stringify(products));
      const inStorage = await AsyncStorage.getItem('gotMarketplace');
      console.log(JSON.parse(inStorage));
    },

    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProducts = products.map(p => {
        return p.id === id && p.quantity >= 1
          ? { ...p, quantity: p.quantity - 1 }
          : p;
      });

      setProducts(updatedProducts);

      await AsyncStorage.setItem(
        'gotMarketplace',
        JSON.stringify(updatedProducts),
      );

      const inStorage = await AsyncStorage.getItem('gotMarketplace');
      console.log(JSON.parse(inStorage));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
