const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'hello@dicoengage.com'
const SENDER_NAME = process.env.SENDER_NAME || 'DICO'

async function sendEmail(to: string, subject: string, html: string) {
  if (!BREVO_API_KEY) {
    console.error('Missing BREVO_API_KEY in .env file')
    return
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Brevo API Error:', errorData)
    }
  } catch (error) {
    console.error('Email send failed:', error)
  }
}

function baseTemplate(content: string) {
  return `
    <div style="font-family:Arial;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0">
      <div style="background:#0A3D2B;padding:24px;text-align:center">
        <span style="color:#E8C040;font-size:22px;font-weight:bold;font-family:Georgia">DI</span>
        <span style="color:#fff;font-size:22px;font-weight:bold;font-family:Georgia">CO</span>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0">Digital Constituency Office</p>
      </div>
      <div style="padding:32px 24px">${content}</div>
      <div style="background:#F7F4EE;padding:16px 24px;text-align:center;font-size:11px;color:#999">
        © ${new Date().getFullYear()} DICO Platform · Nigeria
      </div>
    </div>`
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const html = baseTemplate(`
    <p style="color:#333;font-size:15px;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
    <p style="color:#666;font-size:14px;margin:0 0 20px">Welcome to DICO. Use the code below to verify your email:</p>
    <div style="background:#F0F8F3;border:1px solid #D8E4DC;border-radius:8px;padding:20px;text-align:center;margin:0 0 20px">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0A3D2B;font-family:monospace">${otp}</span>
      <p style="font-size:12px;color:#888;margin:6px 0 0">Expires in 15 minutes</p>
    </div>
    <p style="color:#999;font-size:12px;margin:0">If you didn't create an account, ignore this email.</p>
  `)
  await sendEmail(email, `${otp} is your DICO verification code`, html)
}

export async function sendAdminAlert(subject: string, message: string) {
  const html = baseTemplate(`
    <h2 style="color:#0D1B12;font-size:18px;margin:0 0 16px;">${subject}</h2>
    <p style="color:#666;font-size:14px;line-height:1.6;">${message}</p>
    <a href="https://dicoengage.com/admin" style="display:inline-block;background-color:#C8960A;color:#0D1B12;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;margin-top:20px;">
      Go to Admin Dashboard
    </a>
  `)
  // Send to your admin email
  await sendEmail('tech.dico.ng@gmail.com', `[Action Required] ${subject}`, html)
}

export async function sendUserAlert(email: string, subject: string, message: string) {
  const html = baseTemplate(`
    <h2 style="color:#0D1B12;font-size:18px;margin:0 0 16px;">${subject}</h2>
    <p style="color:#666;font-size:14px;line-height:1.6;">${message}</p>
    <a href="https://dicoengage.com/dashboard" style="display:inline-block;background-color:#C8960A;color:#0D1B12;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;margin-top:20px;">
      View Dashboard
    </a>
  `)
  await sendEmail(email, subject, html)
}