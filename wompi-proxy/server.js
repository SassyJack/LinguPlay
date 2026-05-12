import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:8081', process.env.FRONTEND_URL].filter(Boolean),
}));
app.use(express.json());

const WOMPI_API = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';

function generateSignature(reference, amountInCents, currency) {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  return crypto
    .createHash('sha256')
    .update(integrityKey + reference + amountInCents + currency)
    .digest('hex');
}

app.post('/create-transaction', async (req, res) => {
  try {
    const {
      amount_in_cents,
      currency = 'COP',
      customer_email,
      customer_fullname,
      payment_method_type,
      phone_number,
      user_legal_id,
      user_legal_id_type,
      user_type,
      payment_description,
      reference,
    } = req.body;

    if (!amount_in_cents || !customer_email || !payment_method_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const signature = generateSignature(reference, amount_in_cents, currency);

    const payment_method = { type: payment_method_type };

    switch (payment_method_type) {
      case 'NEQUI':
        if (phone_number) payment_method.phone_number = phone_number;
        break;
      case 'DAVIPLATA':
        if (phone_number) payment_method.phone_number = phone_number;
        if (user_legal_id) payment_method.user_legal_id = user_legal_id;
        if (user_legal_id_type) payment_method.user_legal_id_type = user_legal_id_type;
        if (payment_description) payment_method.payment_description = payment_description;
        break;
      case 'BANCOLOMBIA_TRANSFER':
        payment_method.user_type = user_type || 'PERSON';
        payment_method.payment_description = payment_description || 'Pago LinguaPlay';
        if (process.env.WOMPI_API_URL?.includes('sandbox')) {
          payment_method.sandbox_status = 'APPROVED';
        }
        break;
    }

    const payload = {
      amount_in_cents,
      currency,
      reference,
      customer_email,
      payment_method,
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:8081'}?payment_callback=1`,
      signature,
    };
    if (customer_fullname) {
      payload.customer_fullname = customer_fullname;
    }

    console.log('Wompi request:', JSON.stringify({ ...payload, signature: '[REDACTED]' }, null, 2));

    const response = await fetch(`${WOMPI_API}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Wompi response status:', response.status, JSON.stringify(data, null, 2));

    if (!response.ok) {
      const wompiError = data?.error?.type
        ? `${data.error.type}: ${data.error.messages?.join?.(', ') || JSON.stringify(data.error)}`
        : JSON.stringify(data);
      return res.status(response.status).json({ error: wompiError });
    }

    res.json({
      transaction_id: data.data?.id,
      reference: data.data?.reference,
      checkout_url: data.data?.redirect_url,
      status: data.data?.status,
    });
  } catch (error) {
    console.error('Wompi create error:', error.message);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.get('/verify-transaction', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing transaction id' });
    }

    const response = await fetch(`${WOMPI_API}/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json({
      transaction_id: data.data?.id,
      reference: data.data?.reference,
      status: data.data?.status,
      amount_in_cents: data.data?.amount_in_cents,
      currency: data.data?.currency,
      payment_method_type: data.data?.payment_method?.type,
      customer_email: data.data?.customer_email,
      created_at: data.data?.created_at,
    });
  } catch (error) {
    console.error('Wompi verify error:', error.message);
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

app.post('/webhook', (req, res) => {
  const event = req.body;

  console.log('Wompi webhook received:', JSON.stringify(event, null, 2));

  if (event.event === 'transaction.updated' && event.data?.transaction?.status === 'APPROVED') {
    const { reference, id } = event.data.transaction;
    console.log(`Payment approved! Reference: ${reference}, ID: ${id}`);
  }

  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Wompi proxy running on port ${PORT}`);
});
