import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// Create a context to hold the state and functions related to the shopping cart
const Context = createContext();

// This component provides the state and functions to its children using context
export const StateContext = ({ children }) => {
  // Define various pieces of state related to the shopping cart
  const [showCart, setShowCart] = useState(false); // Whether the cart is visible
  const [cartItems, setCartItems] = useState([]); // List of items in the cart
  const [totalPrice, setTotalPrice] = useState(0); // Total price of items in the cart
  const [totalQuantities, setTotalQuantities] = useState(0); // Total quantity of items in the cart
  const [qty, setQty] = useState(1); // Quantity of a specific product being added

  let foundProduct; // To store a found product in the cart
  let index; // To store the index of a found product in the cart

  // Function to add a product to the cart
  const onAdd = (product, quantity) => {
    const checkProductInCart = cartItems.find(
      (item) => item._id === product._id
    );

    // Update total price and total quantities
    setTotalPrice(
      (prevTotalPrice) => prevTotalPrice + product.price * quantity
    );
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

    if (checkProductInCart) {
      // If product is already in cart, update its quantity
      const updatedCartItems = cartItems.map((cartProduct) => {
        if (cartProduct._id === product._id)
          return {
            ...cartProduct,
            quantity: cartProduct.quantity + quantity,
          };
        return cartProduct;
      });

      setCartItems(updatedCartItems);
    } else {
      // If product is not in cart, add it with the specified quantity
      product.quantity = quantity;
      setCartItems([...cartItems, { ...product }]);
    }

    toast.success(`${qty} ${product.name} added to the cart.`);
  };

  // Function to remove a product from the cart
  const onRemove = (product) => {
    foundProduct = cartItems.find((item) => item._id === product._id);
    const newCartItems = cartItems.filter((item) => item._id !== product._id);

    // Update total price and total quantities
    setTotalPrice(
      (prevTotalPrice) =>
        prevTotalPrice - foundProduct.price * foundProduct.quantity
    );
    setTotalQuantities(
      (prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity
    );
    setCartItems(newCartItems);
  };

  // Function to toggle the quantity of a cart item
  const toggleCartItemQuanitity = (id, value) => {
    foundProduct = cartItems.find((item) => item._id === id);
    index = cartItems.findIndex((product) => product._id === id);
    const newCartItems = cartItems.filter((item) => item._id !== id);

    if (value === "inc") {
      // Increase quantity and update total price and quantities
      setCartItems([
        ...newCartItems,
        { ...foundProduct, quantity: foundProduct.quantity + 1 },
      ]);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + 1);
    } else if (value === "dec") {
      // Decrease quantity if greater than 1, and update total price and quantities
      if (foundProduct.quantity > 1) {
        setCartItems([
          ...newCartItems,
          { ...foundProduct, quantity: foundProduct.quantity - 1 },
        ]);
        setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
        setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
      }
    }
  };

  // Function to increase the quantity of a specific product
  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  // Function to decrease the quantity of a specific product, with a minimum of 1
  const decQty = () => {
    setQty((prevQty) => {
      if (prevQty - 1 < 1) return 1;
      return prevQty - 1;
    });
  };

  // Provide the defined state and functions to the components that consume this context
  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        totalPrice,
        totalQuantities,
        qty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuanitity,
        onRemove,
        setCartItems,
        setTotalPrice,
        setTotalQuantities,
      }}
    >
      {children}
    </Context.Provider>
  );
};

// Custom hook to use the state and functions from the context
export const useStateContext = () => useContext(Context);
