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
  const cartRef = useRef();
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    setShowCart,
    toggleCartItemQuantity,
    onRemove,
  } = useStateContext();

  // Function to handle the checkout process
  const handleCheckout = async () => {
    // Fetch the Stripe instance
    const stripe = await getStripe();

    // Send a request to your server to create a checkout session
    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems),
    });

    // Check if there's a server error
    if (response.statusCode === 500) return;

    // Show loading toast while redirecting to checkout
    toast.loading("Redirecting to checkout...");

    // Redirect to the Stripe checkout page using the session ID
    stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-container">
        {/* Button to close the cart */}
        <button
          type="button"
          className="cart-heading"
          onClick={() => setShowCart(false)}
        >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-item">({totalQuantities} items)</span>
        </button>

        {/* Displayed when the cart is empty */}
        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        {/* Display cart items */}
        <div className="product-container">
          {cartItems.length >= 1 &&
            cartItems.map((item) => (
              <div className="product" key={item.id}>
                <img
                  src={urlFor(item?.image[0])}
                  className="cart-product-image"
                  alt=""
                />
                <div className="item-desc">
                  <div className="flex top">
                    <h5>{item.name}</h5>
                    <h4>{item.price}</h4>
                  </div>
                  <div className="flex bottom">
                    <div>
                      <p className="quantity-desc">
                        {/* Buttons to adjust item quantity */}
                        <span
                          className="minus"
                          onClick={() => toggleCartItemQuantity}
                        >
                          <AiOutlineMinus />
                        </span>
                        <span className="num" onClick="">
                          {item.quantity}
                        </span>
                        <span
                          className="plus"
                          onClick={() => toggleCartItemQuantity}
                        ></span>
                      </p>
                    </div>
                    {/* Button to remove an item from the cart */}
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => onRemove(item)}
                    >
                      <TiDeleteOutline />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Display subtotal and checkout button */}
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              {/* Button to initiate the checkout process */}
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
