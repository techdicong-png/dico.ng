// src/app/api/redeem/kyc/verify-bank/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  const { account_number, bank_code } = await request.json()
  try {
    const { data } = await axios.get('https://api.paystack.co/bank/resolve', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      params: { account_number, bank_code },
    })
    return NextResponse.json(data.data)
  } catch (err: any) {
    return NextResponse.json({ error: err.response?.data?.message || 'Verification failed' }, { status: 400 })
  }
}
