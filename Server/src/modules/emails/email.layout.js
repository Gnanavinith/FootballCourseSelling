/**
 * Vanakkam Soccer: Email Master Layout & Components
 * Table-based, 600px, inline CSS, email-safe, dark mode ready.
 *
 * NOTE: font stacks use SINGLE quotes on purpose. They are injected into
 * style="..." attributes, so double quotes would end the attribute early and
 * make mail clients drop the remaining styles (padding, colours, widths).
 */

const FONT_HEADING = "Archivo, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans Tamil', 'Nirmala UI', 'Tamil Sangam MN', sans-serif"
const FONT_BODY = "'Plus Jakarta Sans', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans Tamil', 'Nirmala UI', 'Tamil Sangam MN', sans-serif"

export function renderBlock(block) {
  if (!block) return ''
  switch (block.type) {
    case 'heading': {
      const isH1 = block.level !== 'h2'
      const fontSize = isH1 ? '26px' : '19px'
      const lineHeight = isH1 ? '1.25' : '1.3'
      const marginBottom = isH1 ? '18px' : '12px'
      return `
        <h1 class="heading-text" style="margin:0 0 ${marginBottom}; padding:0; font-family:${FONT_HEADING}; font-size:${fontSize}; line-height:${lineHeight}; font-weight:800; color:#0A0A09; text-align:left;">
          ${block.text || ''}
        </h1>
      `
    }
    case 'paragraph': {
      return `
        <p class="body-text" style="margin:0 0 16px; padding:0; font-family:${FONT_BODY}; font-size:16px; line-height:1.6; color:#232321; text-align:left;">
          ${block.text || ''}
        </p>
      `
    }
    case 'button': {
      const label = block.label || 'View details'
      const url = block.url || '#'
      return `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:24px 0 20px 0;">
          <tr>
            <td align="center" bgcolor="#FFD400" style="border-radius:10px; background-color:#FFD400;">
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block; padding:15px 32px; min-height:44px; box-sizing:border-box; font-family:${FONT_HEADING}; font-size:15px; font-weight:800; color:#0A0A09; text-decoration:none; border-radius:10px; line-height:1.2; letter-spacing:0.01em; mso-padding-alt:0;">
                ${label}
              </a>
            </td>
          </tr>
        </table>
      `
    }
    case 'details': {
      const items = block.items || []
      if (!items.length) return ''
      const last = items.length - 1
      const rows = items
        .map((item, i) => {
          const border = i === last ? 'none' : '1px solid #DEDED8'
          return `
            <tr>
              <td class="details-label" width="140" valign="top" style="padding:12px 16px; width:140px; font-family:${FONT_BODY}; font-size:13px; line-height:1.5; color:#52524D; border-bottom:${border}; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; vertical-align:top; text-align:left;">
                ${item.label || ''}
              </td>
              <td class="details-val" valign="top" style="padding:12px 16px; font-family:${FONT_BODY}; font-size:15px; line-height:1.5; color:#0A0A09; border-bottom:${border}; font-weight:600; vertical-align:top; text-align:left; word-break:break-word;">
                ${item.value || ''}
              </td>
            </tr>
          `
        })
        .join('')
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="details-panel" style="margin:20px 0; background-color:#F7F7F5; border:1px solid #DEDED8; border-radius:10px; border-collapse:separate; border-spacing:0; overflow:hidden;">
          ${rows}
        </table>
      `
    }
    case 'note': {
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:18px 0;">
          <tr>
            <td class="note-box" style="padding:14px 18px; background-color:#F7F7F5; border-left:3px solid #FFD400; border-radius:0 8px 8px 0; font-family:${FONT_BODY}; font-size:14px; line-height:1.6; color:#52524D; text-align:left;">
              ${block.text || ''}
            </td>
          </tr>
        </table>
      `
    }
    case 'divider': {
      return `
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:22px 0;">
          <tr>
            <td class="divider-line" style="border-top:1px solid #DEDED8; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>
        </table>
      `
    }
    default:
      return ''
  }
}

export function renderEmailLayout({
  preheader = '',
  contentHtml = '',
  settings = {},
  unsubscribeUrl = null,
  reason = 'You received this email because of your account or activity on Vanakkam Soccer.',
}) {
  const fromName = settings.fromName || 'Vanakkam Soccer'
  const logoUrl = settings.logoUrl || 'https://vanakkamsoccer.com/logo.png'
  const address = settings.footerAddress || 'Vanakkam Soccer Academy, Chennai, Tamil Nadu, India'
  const supportEmail = settings.supportEmail || 'support@vanakkamsoccer.com'
  const whatsapp = settings.whatsappNumber || '+91 98765 43210'
  const youtubeUrl = settings.youtubeUrl || 'https://youtube.com/@vanakkamsoccer'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${fromName}</title>
  <style type="text/css">
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F7F7F5; }
    a { color: #0B663A; text-decoration: underline; }
    a.btn-primary { color: #0A0A09 !important; text-decoration: none !important; }
    @media only screen and (max-width: 480px) {
      .card-pad { padding: 24px 18px 22px 18px !important; }
      .header-pad { padding: 16px 18px !important; }
      .hide-sm { display: none !important; }
      .heading-text { font-size: 22px !important; }
      .details-label { width: 36% !important; padding: 10px 12px !important; font-size: 11px !important; }
      .details-val { padding: 10px 12px !important; font-size: 14px !important; }
      .btn-primary { display: block !important; text-align: center !important; }
      .btn-wrap { width: 100% !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .bg-page { background-color: #0A0A09 !important; }
      .email-card { background-color: #141413 !important; border-color: #2A2A27 !important; }
      .heading-text { color: #F7F7F5 !important; }
      .body-text { color: #E4E4DE !important; }
      .details-panel { background-color: #1C1C1A !important; border-color: #2A2A27 !important; }
      .details-label { color: #C4C4BC !important; border-bottom-color: #2A2A27 !important; }
      .details-val { color: #F7F7F5 !important; border-bottom-color: #2A2A27 !important; }
      .note-box { background-color: #1C1C1A !important; color: #C4C4BC !important; }
      .divider-line { border-top-color: #2A2A27 !important; }
      .footer-text { color: #9A9A90 !important; }
      .footer-link { color: #FFE03D !important; }
    }
  </style>
</head>
<body class="bg-page" style="margin:0; padding:0; background-color:#F7F7F5; font-family:${FONT_BODY};">
  ${
    preheader
      ? `<div style="display:none; font-size:1px; color:#F7F7F5; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
          ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>`
      : ''
  }

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" class="bg-page" style="background-color:#F7F7F5; margin:0; padding:24px 0 36px 0;">
    <tr>
      <td align="center" style="padding:0 12px;">
        <!-- Container 600px -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; border-collapse:separate;">

          <!-- Header Band -->
          <tr>
            <td class="header-pad" bgcolor="#0A0A09" style="background-color:#0A0A09; padding:20px 32px; border-radius:12px 12px 0 0; text-align:left; border-bottom:3px solid #FFD400;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle" style="vertical-align:middle;">
                    <a href="https://vanakkamsoccer.com" target="_blank" rel="noopener noreferrer" style="text-decoration:none; display:inline-block;">
                      <img src="${logoUrl}" alt="Vanakkam Soccer" width="140" style="display:block; max-height:38px; width:auto; border:0; font-family:${FONT_HEADING}; font-size:18px; font-weight:800; color:#FFD400; line-height:38px;" />
                    </a>
                  </td>
                  <td class="hide-sm" align="right" valign="middle" style="vertical-align:middle; font-family:${FONT_HEADING}; font-size:11px; font-weight:800; color:#FFD400; text-transform:uppercase; letter-spacing:0.18em; white-space:nowrap;">
                    Elite Football Academy
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main White Card -->
          <tr>
            <td class="email-card card-pad" bgcolor="#FFFFFF" style="background-color:#FFFFFF; border:1px solid #DEDED8; border-top:none; border-radius:0 0 12px 12px; padding:36px 36px 30px 36px; text-align:left; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:26px 16px 0 16px; text-align:center;">
              <p class="footer-text" style="margin:0 0 6px; font-family:${FONT_BODY}; font-size:12px; line-height:1.5; color:#70706A;">
                <strong>${fromName}</strong> &bull; Tamil &amp; English Match Coaching
              </p>
              <p class="footer-text" style="margin:0 0 6px; font-family:${FONT_BODY}; font-size:12px; line-height:1.5; color:#70706A;">
                ${address}
              </p>
              <p class="footer-text" style="margin:0 0 10px; font-family:${FONT_BODY}; font-size:12px; line-height:1.7; color:#70706A;">
                Need help? <a href="mailto:${supportEmail}" class="footer-link" style="color:#0B663A; font-weight:600;">${supportEmail}</a>
                &bull; WhatsApp: <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" class="footer-link" style="color:#0B663A; font-weight:600;">${whatsapp}</a>
                &bull; <a href="${youtubeUrl}" class="footer-link" style="color:#0B663A; font-weight:600;">YouTube</a>
              </p>
              <p class="footer-text" style="margin:0 0 6px; font-family:${FONT_BODY}; font-size:11px; line-height:1.4; color:#70706A;">
                ${reason}
              </p>
              ${
                unsubscribeUrl
                  ? `<p class="footer-text" style="margin:6px 0 0; font-family:${FONT_BODY}; font-size:11px; color:#70706A;">
                      <a href="${unsubscribeUrl}" class="footer-link" style="color:#70706A; text-decoration:underline;">Unsubscribe from announcements</a>
                    </p>`
                  : ''
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}