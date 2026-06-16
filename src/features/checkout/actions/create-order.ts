"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrderAction(
  cartItems: any[],
  shippingDetails: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to place an order." };
    }

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty." };
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.quantity;
    }
    
    // Hardcoded shipping and tax for now
    const shippingAmount = subtotal > 200000 ? 0 : 10000; // Free shipping over ₹2000
    const taxAmount = Math.round(subtotal * 0.18); // 18% GST mock
    const totalAmount = subtotal + shippingAmount + taxAmount;

    // Format address
    const addressJson = {
      full_name: shippingDetails.fullName,
      phone: shippingDetails.phone,
      address_line_1: shippingDetails.addressLine1,
      address_line_2: shippingDetails.addressLine2 || null,
      city: shippingDetails.city,
      state: shippingDetails.state,
      postal_code: shippingDetails.postalCode,
      country: "IN"
    };

    // Generate Order Number
    const orderNumber = `ORD-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Prepare items JSON payload
    const orderItemsData = cartItems.map((item) => ({
      variant_id: item.variantId,
      product_name: item.name,
      variant_sku: item.sku || "N/A",
      variant_size: item.size || null,
      variant_color: item.color || null,
      product_image_url: item.image || null,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
    }));

    // 2. Call the secure PostgreSQL transaction
    const { data: orderId, error: transactionError } = await supabase.rpc(
      "create_order_transaction",
      {
        p_user_id: user.id,
        p_order_number: orderNumber,
        p_subtotal: subtotal,
        p_shipping_amount: shippingAmount,
        p_tax_amount: taxAmount,
        p_total_amount: totalAmount,
        p_shipping_address: addressJson,
        p_items: orderItemsData
      }
    );

    if (transactionError || !orderId) {
      console.error("Transaction failed:", transactionError);
      
      // If the error message contains 'Insufficient stock', extract and show it nicely
      if (transactionError?.message?.includes("Insufficient stock")) {
        return { success: false, error: transactionError.message };
      }
      
      return { success: false, error: "Failed to create order. Please try again." };
    }

    revalidatePath("/account/orders");

    return { 
      success: true, 
      orderId: orderId, 
      orderNumber: orderNumber 
    };

  } catch (error: any) {
    console.error("Unexpected error in createOrderAction:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
