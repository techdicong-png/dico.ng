// src/app/api/redeem/banks/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  const { data } = await axios.get('https://api.paystack.co/bank', {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    params: { country: 'nigeria', perPage: 100 },
  })
  return NextResponse.json({ banks: data.data || [] })
}
