import Stripe from "stripe";

// Create a new Stripe instance using the Stripe secret key from environment variables
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

// Define an asynchronous function that handles incoming HTTP requests
export default async function handler(req, res) {
  // Check if the incoming request method is POST
  if (req.method === "POST") {
    try {
      // Define parameters for creating a Stripe Checkout session
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [{ shipping_rates: "shr_1NnF2LH57NAD1G7vD7twg8r3" }],
        // Map the items in the request body to Stripe line items
        line_items: req.body.map((item) => {
          // Transform image URL to use a CDN
          const img = item.images[0].asset._ref;
          const newImage = img
            .replace(
              "image-",
              "https://cdn.sanity.io/images/i3hpjxyf/production/"
            )
            .replace("-webp", ".webp");

          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
                images: [newImage],
              },
              // Convert the item price to cents (Stripe expects prices in the smallest currency unit)
              unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity,
          };
        }),
        // Define success and cancel URLs for redirection after checkout
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/canceled`,
      };

      // Create a Stripe Checkout session using the defined parameters
      const session = await stripe.checkout.sessions.create(params);

      // Respond with a 200 OK status and the created session details
      res.status(200).json(session);
    } catch (err) {
      // Handle errors by responding with an appropriate status code and error message
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    // If the request method is not POST, set the "Allow" header and respond with a 405 Method Not Allowed status
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
