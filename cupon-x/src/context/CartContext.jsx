import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Cargar carrito desde localStorage
    try {
      const saved = localStorage.getItem('cuponx.cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cuponx.cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (oferta) => {
    // Verificar si la oferta ya está en el carrito
    const exists = cartItems.find(item => item.id === oferta.id);
    
    if (exists) {
      // Incrementar cantidad
      setCartItems(cartItems.map(item => 
        item.id === oferta.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      // Agregar nueva oferta con cantidad 1
      setCartItems([...cartItems, { ...oferta, cantidad: 1 }]);
    }
  };

  const removeFromCart = (ofertaId) => {
    setCartItems(cartItems.filter(item => item.id !== ofertaId));
  };

  const updateQuantity = (ofertaId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(ofertaId);
      return;
    }

    if (cantidad > 20) {
      alert('Máximo 20 cupones por oferta');
      return;
    }

    setCartItems(cartItems.map(item => 
      item.id === ofertaId 
        ? { ...item, cantidad }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const precio = Number(item.precio_oferta) || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
