import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.EMAIL_FROM || 'BoardJobs <noreply@boardjobs.com>';
  const mail = { from, to, subject, text, html };

  const transport = getTransporter();
  if (!transport) {
    console.log('\n--- Email (console mode) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('----------------------------\n');
    return;
  }

  await transport.sendMail(mail);
}

export async function notifyApplicationSubmitted({ candidate, job, employerEmail }) {
  await sendEmail({
    to: candidate.email,
    subject: `Application submitted — ${job.title}`,
    text: `Hi ${candidate.name},\n\nYour application for "${job.title}" at ${job.company} was submitted successfully.\n\nWe'll notify you when the status changes.\n\n— BoardJobs`
  });

  if (employerEmail) {
    await sendEmail({
      to: employerEmail,
      subject: `New application — ${job.title}`,
      text: `A new candidate (${candidate.name}) applied for "${job.title}".\n\nLog in to your employer dashboard to review.\n\n— BoardJobs`
    });
  }
}

export async function notifyStatusUpdate({ candidate, job, status }) {
  await sendEmail({
    to: candidate.email,
    subject: `Application update — ${job.title}`,
    text: `Hi ${candidate.name},\n\nYour application for "${job.title}" at ${job.company} is now: ${status.toUpperCase()}.\n\n— BoardJobs`
  });
}
