/**
 * 🎯 Zarinpal Payment Service - Stub Implementation
 */

export const startZarinpalPayment = async (paymentData) => {
  console.log("Zarinpal payment started:", paymentData);

  // Stub implementation - replace with actual Zarinpal integration
  return {
    success: true,
    redirectUrl: "/payment/success",
    transactionId: "stub_" + Date.now(),
  };
};

export const simulatePayment = async (paymentData) => {
  console.log("Simulating payment:", paymentData);

  // Stub implementation for testing
  return {
    success: true,
    message: "Payment simulated successfully",
    transactionId: "sim_" + Date.now(),
  };
};

export const verifyPayment = async (authority, amount) => {
  console.log("Verifying payment:", { authority, amount });

  // Stub implementation
  return {
    success: true,
    verified: true,
    transactionId: authority,
  };
};
