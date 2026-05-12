const WOMPI_PROXY_URL =
  process.env.EXPO_PUBLIC_WOMPI_PROXY_URL || 'http://localhost:3002';

export interface CreateTransactionParams {
  amountInCents: number;
  currency?: string;
  customerEmail: string;
  customerFullname: string;
  paymentMethodType: 'NEQUI' | 'BANCOLOMBIA' | 'DAVIPLATA' | 'BRE_B';
  reference: string;
}

export interface TransactionResult {
  transaction_id: string;
  reference: string;
  checkout_url: string;
  status: string;
}

export interface VerifiedTransaction {
  transaction_id: string;
  reference: string;
  status: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  customer_email: string;
  created_at: string;
}

async function createTransaction(
  params: CreateTransactionParams
): Promise<TransactionResult> {
  const response = await fetch(`${WOMPI_PROXY_URL}/create-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency || 'COP',
      customer_email: params.customerEmail,
      customer_fullname: params.customerFullname,
      payment_method_type: params.paymentMethodType,
      reference: params.reference,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al crear el pago');
  }

  return response.json();
}

async function verifyTransaction(transactionId: string): Promise<VerifiedTransaction> {
  const response = await fetch(
    `${WOMPI_PROXY_URL}/verify-transaction?id=${transactionId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al verificar el pago');
  }

  return response.json();
}

export const wompiService = {
  createTransaction,
  verifyTransaction,
};
