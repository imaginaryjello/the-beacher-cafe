// backend/config/email.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// WHY the guard here and not only in index.js: ES module imports are hoisted,
// so this file runs before index.js's env check. Without this, a missing key
// throws an opaque error from inside node_modules with no hint of the cause.
if (!process.env.RESEND_API_KEY) {
  console.error(
    "Missing required environment variable: RESEND_API_KEY. See .env.example.",
  );
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

// WHY onboarding@resend.dev: Resend's sandbox sender that works
// immediately without verifying a domain. Swap for your verified
// domain (e.g. reservations@thebeachercafe.com) in production.
const FROM = "The Beacher Café <onboarding@resend.dev>";

// ─────────────────────────────────────────
// Reservation received (auto, on submit)
// ─────────────────────────────────────────
export const sendReservationReceived = async (
  to,
  { name, date, time, guests },
) => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "We received your reservation request — The Beacher Café",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; color: #3f2a1d;">
          <div style="background:#3f2a1d; padding:24px; text-align:center;">
            <h1 style="color:#f5e8c7; margin:0; font-size:24px;">The Beacher Café</h1>
            <p style="color:#c2410c; margin:4px 0 0; font-size:12px; letter-spacing:2px;">EST. 1986</p>
          </div>
          <div style="padding:24px; background:#f5e8c7;">
            <p>Hi ${name},</p>
            <p>Thanks for your reservation request! Here's what we've got:</p>
            <table style="width:100%; margin:16px 0; font-size:15px;">
              <tr><td style="padding:6px 0;"><strong>Date:</strong></td><td>${date}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Time:</strong></td><td>${time}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Guests:</strong></td><td>${guests}</td></tr>
            </table>
            <p>We'll confirm shortly. You'll get another email once it's accepted.</p>
            <p style="margin-top:24px;">Come sit by the beach with us,<br/>The Beacher Café</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email] received failed:", err.message);
  }
};

// ─────────────────────────────────────────
// Reservation confirmed
// ─────────────────────────────────────────
export const sendReservationConfirmed = async (
  to,
  { name, date, time, guests },
) => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your table is confirmed! — The Beacher Café",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; color: #3f2a1d;">
          <div style="background:#3f2a1d; padding:24px; text-align:center;">
            <h1 style="color:#f5e8c7; margin:0; font-size:24px;">The Beacher Café</h1>
            <p style="color:#c2410c; margin:4px 0 0; font-size:12px; letter-spacing:2px;">EST. 1986</p>
          </div>
          <div style="padding:24px; background:#f5e8c7;">
            <div style="text-align:center; font-size:40px;">🎉</div>
            <p>Hi ${name},</p>
            <p><strong>Your table is confirmed!</strong> We look forward to seeing you.</p>
            <table style="width:100%; margin:16px 0; font-size:15px;">
              <tr><td style="padding:6px 0;"><strong>Date:</strong></td><td>${date}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Time:</strong></td><td>${time}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Guests:</strong></td><td>${guests}</td></tr>
            </table>
            <p>If you need to change anything, just give us a call.</p>
            <p style="margin-top:24px;">See you soon,<br/>The Beacher Café</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email] confirmed failed:", err.message);
  }
};

// ─────────────────────────────────────────
// Password reset
// ─────────────────────────────────────────
export const sendPasswordResetEmail = async (to, { name, resetUrl }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset your password — The Beacher Café",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; color: #3f2a1d;">
          <div style="background:#3f2a1d; padding:24px; text-align:center;">
            <h1 style="color:#f5e8c7; margin:0; font-size:24px;">The Beacher Café</h1>
            <p style="color:#c2410c; margin:4px 0 0; font-size:12px; letter-spacing:2px;">EST. 1986</p>
          </div>
          <div style="padding:24px; background:#f5e8c7;">
            <p>Hi ${name},</p>
            <p>We received a request to reset your dashboard password. Click the button below to set a new one.</p>
            <div style="text-align:center; margin:24px 0;">
              <a href="${resetUrl}"
                style="background:#c2410c; color:#fff; padding:12px 28px; border-radius:24px;
                       text-decoration:none; font-weight:bold; font-size:15px;">
                Reset Password
              </a>
            </div>
            <p style="font-size:13px; color:#6b5a47;">This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.</p>
            <p style="margin-top:24px;">— The Beacher Café</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email] password reset failed:", err.message);
  }
};

// ─────────────────────────────────────────
// Reservation declined
// ─────────────────────────────────────────
export const sendReservationDeclined = async (to, { name, date, time }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "About your reservation request — The Beacher Café",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; color: #3f2a1d;">
          <div style="background:#3f2a1d; padding:24px; text-align:center;">
            <h1 style="color:#f5e8c7; margin:0; font-size:24px;">The Beacher Café</h1>
            <p style="color:#c2410c; margin:4px 0 0; font-size:12px; letter-spacing:2px;">EST. 1986</p>
          </div>
          <div style="padding:24px; background:#f5e8c7;">
            <p>Hi ${name},</p>
            <p>Unfortunately we're unable to accommodate your reservation for <strong>${date} at ${time}</strong>. We're likely fully booked at that time.</p>
            <p>We'd love to still have you — please call us to find another time that works, or submit a new request for a different slot.</p>
            <p style="margin-top:24px;">Hope to see you soon,<br/>The Beacher Café</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.error("[Email] declined failed:", err.message);
  }
};
