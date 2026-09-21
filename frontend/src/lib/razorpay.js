const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loader = null;

/**
 * Loads Razorpay's hosted checkout on demand. Card details are entered inside
 * Razorpay's own iframe and never touch this application or its server.
 */
export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        loader = null;
        reject(new Error('The payment window could not be loaded. Check your connection.'));
      };
      document.head.appendChild(script);
    });
  }

  return loader;
}
