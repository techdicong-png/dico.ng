import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  await resend.emails.send({
    from: 'DICO <onboarding@resend.dev>',
    to: email,
    subject: `${otp} is your DICO verification code`,
    html,
  })
}

export async function sendAdminAlert(subject: string, message: string) {
  const html = `
    <div style="font-family:Arial;max-width:480px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
      <div style="background:#0A3D2B;padding:24px;text-align:center;">
        <span style="color:#E8C040;font-size:22px;font-weight:bold;">DI</span><span style="color:#fff;font-size:22px;font-weight:bold;">CO</span>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0">Admin Alert System</p>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#0D1B12;font-size:18px;margin-bottom:16px;">${subject}</h2>
        <p style="color:#666;font-size:14px;line-height:1.6;">${message}</p>
        <a href="https://dicoengage.com/admin" style="display:inline-block;background-color:#C8960A;color:#0D1B12;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;margin-top:20px;">
          Go to Admin Dashboard
        </a>
      </div>
    </div>`

  await resend.emails.send({
    from: 'DICO Alerts <onboarding@resend.dev>',
    to: 'tech.dico.ng@gmail.com', // Change this to your actual admin email
    subject: `[Action Required] ${subject}`,
    html,
  })
}