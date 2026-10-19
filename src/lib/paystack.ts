import axios from 'axios'

// Asks the bank (through Paystack) who owns an account. Returns the account name, or a plain-language error.
export async function resolveBankAccount(accountNumber: string, bankCode: string): Promise<{ name: string } | { error: string }> {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    return { error: 'The Paystack key is not set on the server (PAYSTACK_SECRET_KEY). Add it and redeploy, or tick "Enter the account name myself".' }
  }
  try {
    const { data } = await axios.get('https://api.paystack.co/bank/resolve', {
      headers: { Authorization: `Bearer ${key}` },
      params: { account_number: accountNumber, bank_code: bankCode },
    })
    return { name: data.data.account_name }
  } catch (err: any) {
    const msg: string | undefined = err.response?.data?.message
    if (msg && /invalid key/i.test(msg)) {
      return { error: 'Paystack rejected the server key. Check PAYSTACK_SECRET_KEY is your secret key (it starts with sk_), then redeploy. Or tick "Enter the account name myself".' }
    }
    return { error: msg || 'Could not verify that account' }
  }
}
