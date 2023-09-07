import React, { useRef } from "react";
import Link from "next/link";
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineLeft,
  AiOutlineShopping,
} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import toast from "react-hot-toast";

import { useStateContext } from "../context/StateContext";
import { urlFor } from "../lib/client";
import getStripe from "../lib/getStripe";

const Cart = () => {
  // Create a reference to the cart container
  const cartRef = useRef();

  // Access the state and functions from a context (e.g., a global state provider)
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    setShowCart,
    toggleCartItemQuantity, // A function to increase/decrease item quantity
    onRemove, // A function to remove an item from the cart
  } = useStateContext();

  // Handle the checkout process when the "Pay with Stripe" button is clicked
  const handleCheckout = async () => {
    // Initialize Stripe with the client-side Stripe library
    const stripe = await getStripe();

    // Send a POST request to your server with cart items
    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems), // Convert cart items to JSON
    });

    // Check if the server returns an error status
    if (response.statusCode === 500) return;

    // Parse the response JSON
    const data = await response.json();

    // Show a loading toast message
    toast.loading("Redirecting to checkout...");

    // Redirect to the Stripe checkout page using the session ID obtained from the server
    stripe.redirectToCheckout({ sessionId: data.id });
  };

  // Render the shopping cart component
  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        {/* Header and title for the shopping cart */}
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)} // Close the cart when clicked
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {/* Displayed when the cart is empty */}
        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)} // Close the cart when clicked
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        {/* Display the list of products in the cart */}
        <div className="product-container">
          {cartItems.length >= 1 &&
            cartItems.map((item) => (
              <div className="product" key={item._id}>
                {/* Display the product image */}
                <img
                  src={urlFor(item?.image[0])}
                  className="cart-product-image"
                />
                <div className="item-desc">
                  <div className="flex top">
                    {/* Display the product name and price */}
                    <h5>{item.name}</h5>
                    <h4>${item.price}</h4>
                  </div>
                  <div className="flex bottom">
                    <div>
                      <p className="quantity-desc">
                        {/* Buttons to increase and decrease item quantity */}
                        <span
                          className="minus"
                          onClick={() =>
                            toggleCartItemQuantity(item._id, "dec")
                          }
                        >
                          <AiOutlineMinus />
                        </span>
                        <span className="num">{item.quantity}</span>
                        <span
                          className="plus"
                          onClick={() =>
                            toggleCartItemQuantity(item._id, "inc")
                          }
                        >
                          <AiOutlinePlus />
                        </span>
                      </p>
                    </div>
                    {/* Button to remove the item from the cart */}
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => onRemove(item)}
                    >
                      <TiDeleteOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Display the subtotal and a button to initiate checkout */}
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              {/* Button to initiate the Stripe checkout process */}
              <button type="button" className="btn" onClick={handleCheckout}>
                Pay with Stripe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
