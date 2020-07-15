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
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const isProductInCart = products.find(p => {
        return p.id === product.id;
      });

      if (isProductInCart) {
        const updatedCart = products.map(p => {
          return p.id === product.id
            ? { ...product, quantity: p.quantity + 1 }
            : p;
        });

        setProducts(updatedCart);

        await AsyncStorage.setItem(
          'gotMarketplace:cart',
          JSON.stringify(updatedCart),
        );
      } else {
        // get the array or products and add a new object to it that has all properties from product
        // and adds one to the property quantity
        const updatedCart = [...products, { ...product, quantity: 1 }];

        setProducts(updatedCart);
        await AsyncStorage.setItem(
          'gotMarketplace:cart',
          JSON.stringify(updatedCart),
        );
        // console.log(products);
      }

      // const inStorage = await AsyncStorage.getItem('gotMarketplace');
      // console.log(JSON.parse(inStorage));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p => {
        return p.id === id ? { ...p, quantity: p.quantity + 1 } : p;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem(
        'gotMarketplace:cart',
        JSON.stringify(newProducts),
      );
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
