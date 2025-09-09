import Stripe from 'stripe';
import { STRIPE_PRICING } from '@/lib/constants';
import { PlanType } from '@/types';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Product IDs (create these in Stripe dashboard)
export const STRIPE_PRODUCT_IDS: Record<PlanType, string> = {
  BASE: process.env.STRIPE_BASE_PRODUCT_ID || 'prod_BASE',
  PLUS: process.env.STRIPE_PLUS_PRODUCT_ID || 'prod_PLUS',
  PRO: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_PRO',
};

// Price IDs (create these in Stripe dashboard)
export const STRIPE_PRICE_IDS: Record<PlanType, { monthly: string; yearly: string }> = {
  BASE: {
    monthly: process.env.STRIPE_BASE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_BASE_YEARLY_PRICE_ID!,
  },
  PLUS: {
    monthly: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PLUS_YEARLY_PRICE_ID!,
  },
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
};

// Create checkout session
export const createCheckoutSession = async ({
  customerId,
  plan,
  interval,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  plan: PlanType;
  interval: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  const priceId = STRIPE_PRICE_IDS[plan][interval];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan,
      interval,
      ...metadata,
    },
  });

  return session;
};

// Create customer portal session
export const createCustomerPortalSession = async ({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
};

// Get subscription details
export const getSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'latest_invoice'],
  });

  return subscription;
};

// Get customer details
export const getCustomer = async (customerId: string) => {
  const customer = await stripe.customers.retrieve(customerId);
  return customer;
};

// Update subscription
export const updateSubscription = async ({
  subscriptionId,
  priceId,
  prorationBehavior = 'create_prorations',
}: {
  subscriptionId: string;
  priceId: string;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}) => {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscriptionId,
        price: priceId,
      },
    ],
    proration_behavior: prorationBehavior,
  });

  return subscription;
};

// Cancel subscription
export const cancelSubscription = async ({
  subscriptionId,
  cancelAtPeriodEnd = true,
}: {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
}) => {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  return subscription;
};

// Reactivate subscription
export const reactivateSubscription = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  return subscription;
};

// Get invoice list
export const getInvoices = async ({
  customerId,
  limit = 10,
  startingAfter,
}: {
  customerId: string;
  limit?: number;
  startingAfter?: string;
}) => {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
    starting_after: startingAfter,
    status: 'paid',
  });

  return invoices;
};

// Webhook event handlers
export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

// Webhook handlers
const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  // TODO: Update database with new subscription
  console.log('Subscription created:', subscription.id);
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  // TODO: Update database with subscription changes
  console.log('Subscription updated:', subscription.id);
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  // TODO: Update database with subscription cancellation
  console.log('Subscription deleted:', subscription.id);
};

const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  // TODO: Handle successful payment
  console.log('Payment succeeded for invoice:', invoice.id);
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  // TODO: Handle failed payment
  console.log('Payment failed for invoice:', invoice.id);
};

// Utility functions
export const formatStripeAmount = (amount: number, currency: string = 'eur') => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const getPlanFromPriceId = (priceId: string): PlanType | null => {
  for (const [plan, prices] of Object.entries(STRIPE_PRICE_IDS)) {
    if (Object.values(prices).includes(priceId)) {
      return plan as PlanType;
    }
  }
  return null;
};

export const getIntervalFromPriceId = (priceId: string): 'month' | 'year' | null => {
  for (const [plan, prices] of Object.entries(STRIPE_PRICE_IDS)) {
    if (prices.monthly === priceId) return 'month';
    if (prices.yearly === priceId) return 'year';
  }
  return null;
};
