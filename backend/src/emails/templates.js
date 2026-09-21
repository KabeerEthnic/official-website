import env from '../config/env.js';

/**
 * Transactional email bodies.
 *
 * Every template returns { subject, html, text }. The HTML is deliberately
 * old-fashioned — tables, inline styles, no external CSS — because that is what
 * mail clients render reliably. The palette matches the storefront: deep green
 * #0F2418, amber #E89B3C, ivory #FAF8F5.
 *
 * Every message also has a plain-text part. Some clients prefer it, and it is
 * what a screen reader or a text-only client will read.
 */

const BRAND = 'Kabeer — The Ethnic Store';
const GREEN = '#0F2418';
const AMBER = '#E89B3C';
const INK = '#2D2A26';
const MUTED = '#6b5e58';

const money = (paise) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const escape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Shared chrome so every message looks like it came from the same boutique. */
function layout({ heading, intro, body = '', footerNote = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${GREEN};font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GREEN};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FAF8F5;border-radius:16px;overflow:hidden;">
        <tr><td style="background:${GREEN};padding:28px 32px;text-align:center;">
          <div style="color:#ffffff;font-size:20px;letter-spacing:3px;text-transform:uppercase;">KABEER</div>
          <div style="color:${AMBER};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">The Ethnic Store</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;color:${INK};font-size:22px;font-weight:normal;">${escape(heading)}</h1>
          <p style="margin:0 0 20px;color:${MUTED};font-size:15px;line-height:1.6;">${intro}</p>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid rgba(45,42,38,0.1);">
          <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
            ${footerNote ? `${escape(footerNote)}<br /><br />` : ''}
            ${escape(BRAND)}<br />
            <a href="${escape(env.FRONTEND_URL)}" style="color:${AMBER};text-decoration:none;">${escape(env.FRONTEND_URL)}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function codeBlock(code) {
  return `<div style="margin:0 0 20px;padding:20px;background:#ffffff;border:1px solid rgba(45,42,38,0.12);border-radius:12px;text-align:center;">
    <div style="font-size:34px;letter-spacing:10px;font-weight:bold;color:${INK};font-family:'Courier New',monospace;">${escape(code)}</div>
  </div>`;
}

/* ------------------------------------------------------------ verification */

export function verificationCode({ name, code, minutes }) {
  return {
    subject: `${code} is your Kabeer verification code`,
    html: layout({
      heading: `Welcome, ${escape(name)}`,
      intro: 'Enter this code to confirm your email address and finish setting up your account.',
      body:
        codeBlock(code) +
        `<p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">This code expires in ${minutes} minutes. If you did not create an account, you can ignore this email.</p>`,
      footerNote: 'We will never ask you for this code by phone or message.',
    }),
    text: [
      `Welcome, ${name}`,
      '',
      `Your Kabeer verification code is: ${code}`,
      `It expires in ${minutes} minutes.`,
      '',
      'If you did not create an account, ignore this email.',
      'We will never ask you for this code by phone or message.',
    ].join('\n'),
  };
}

/* ---------------------------------------------------------- password reset */

export function passwordResetCode({ name, code, minutes }) {
  return {
    subject: `${code} is your Kabeer password reset code`,
    html: layout({
      heading: 'Reset your password',
      intro: `Hello ${escape(name)}, use this code to choose a new password.`,
      body:
        codeBlock(code) +
        `<p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">This code expires in ${minutes} minutes. If you did not ask to reset your password, nothing has changed — you can ignore this email.</p>`,
      footerNote: 'Resetting your password signs you out everywhere else.',
    }),
    text: [
      'Reset your password',
      '',
      `Hello ${name}, your Kabeer password reset code is: ${code}`,
      `It expires in ${minutes} minutes.`,
      '',
      'If you did not request this, nothing has changed and you can ignore this email.',
    ].join('\n'),
  };
}

/* ------------------------------------------------------- order confirmation */

function orderItemsTable(order) {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;color:${INK};font-size:14px;">${escape(item.productName)}<br /><span style="color:${MUTED};font-size:12px;">${escape(item.productSku)} &times; ${item.quantity}</span></td>
        <td style="padding:10px 0;color:${INK};font-size:14px;text-align:right;white-space:nowrap;">${money(item.lineTotal)}</td>
      </tr>`,
    )
    .join('');

  const line = (label, value, accent = false) => `<tr>
      <td style="padding:4px 0;color:${accent ? AMBER : MUTED};font-size:13px;">${escape(label)}</td>
      <td style="padding:4px 0;color:${accent ? AMBER : MUTED};font-size:13px;text-align:right;">${value}</td>
    </tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${rows}
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid rgba(45,42,38,0.1);"></td></tr>
      ${line('Subtotal', money(order.subtotal))}
      ${order.discount > 0 ? line(`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, `-${money(order.discount)}`, true) : ''}
      ${line('Tax', money(order.tax))}
      ${line('Shipping', order.shipping === 0 ? 'Free' : money(order.shipping))}
      <tr>
        <td style="padding:12px 0 0;color:${INK};font-size:16px;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0;color:${INK};font-size:16px;font-weight:bold;text-align:right;">${money(order.total)}</td>
      </tr>
    </table>`;
}

function addressBlock(order) {
  const parts = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    `${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}`,
    order.shippingCountry,
    order.shippingPhone,
  ].filter(Boolean);

  return `<div style="padding:16px;background:#ffffff;border:1px solid rgba(45,42,38,0.12);border-radius:12px;">
      <div style="color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Delivering to</div>
      <div style="color:${INK};font-size:14px;line-height:1.6;">${parts.map(escape).join('<br />')}</div>
    </div>`;
}

const textOrder = (order) =>
  [
    ...order.items.map((i) => `  ${i.productName} (${i.productSku}) x${i.quantity}  ${money(i.lineTotal)}`),
    '',
    `  Subtotal  ${money(order.subtotal)}`,
    ...(order.discount > 0 ? [`  Discount  -${money(order.discount)}`] : []),
    `  Tax       ${money(order.tax)}`,
    `  Shipping  ${order.shipping === 0 ? 'Free' : money(order.shipping)}`,
    `  Total     ${money(order.total)}`,
  ].join('\n');

export function orderConfirmation({ order }) {
  return {
    subject: `Order ${order.orderNumber} received — Kabeer`,
    html: layout({
      heading: `Order ${escape(order.orderNumber)}`,
      intro:
        'Thank you. We have your order and are holding the pieces for you. You will get a second email as soon as the payment is confirmed.',
      body: orderItemsTable(order) + addressBlock(order),
      footerNote: `Questions? Raise an issue from your account and quote ${order.orderNumber}.`,
    }),
    text: [
      `Order ${order.orderNumber} received`,
      '',
      'Thank you. We have your order and are holding the pieces for you.',
      'You will get a second email as soon as payment is confirmed.',
      '',
      textOrder(order),
      '',
      `Delivering to: ${order.shippingName}, ${order.shippingLine1}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}`,
    ].join('\n'),
  };
}

/* ----------------------------------------------------- payment confirmation */

export function paymentConfirmation({ order, paymentId }) {
  return {
    subject: `Payment confirmed for order ${order.orderNumber} — Kabeer`,
    html: layout({
      heading: 'Payment confirmed',
      intro: `We have received ${money(order.total)} for order ${escape(order.orderNumber)}. Your order is now being prepared.`,
      body:
        orderItemsTable(order) +
        `<p style="margin:16px 0 0;color:${MUTED};font-size:12px;">Payment reference: ${escape(paymentId ?? '—')}</p>`,
      footerNote: 'Keep this email as your receipt.',
    }),
    text: [
      'Payment confirmed',
      '',
      `We have received ${money(order.total)} for order ${order.orderNumber}.`,
      'Your order is now being prepared.',
      '',
      textOrder(order),
      '',
      `Payment reference: ${paymentId ?? '—'}`,
      'Keep this email as your receipt.',
    ].join('\n'),
  };
}

/* ----------------------------------------------------------------- support */

export function ticketReceived({ ticket }) {
  return {
    subject: `We have your message — ${ticket.reference}`,
    html: layout({
      heading: `Issue ${escape(ticket.reference)}`,
      intro: `Thank you for getting in touch about "${escape(ticket.subject)}". Someone from the boutique will reply here, and you can follow the conversation from your account.`,
      body: '',
      footerNote: 'Please quote the reference above if you write to us again.',
    }),
    text: [
      `Issue ${ticket.reference}`,
      '',
      `Thank you for getting in touch about "${ticket.subject}".`,
      'Someone from the boutique will reply, and you can follow the conversation',
      'from your account.',
    ].join('\n'),
  };
}

export function ticketReply({ ticket, body }) {
  return {
    subject: `Reply to ${ticket.reference} — Kabeer`,
    html: layout({
      heading: `Re: ${escape(ticket.subject)}`,
      intro: 'The boutique has replied to your issue.',
      body: `<div style="padding:16px;background:#ffffff;border:1px solid rgba(45,42,38,0.12);border-radius:12px;color:${INK};font-size:14px;line-height:1.7;white-space:pre-wrap;">${escape(body)}</div>`,
      footerNote: `Reply from your account to continue the conversation — reference ${ticket.reference}.`,
    }),
    text: [`Re: ${ticket.subject}`, '', body, '', `Reference: ${ticket.reference}`].join('\n'),
  };
}
