const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.NAME_EMAIL,
    pass: process.env.NAME_PASS,
  },
});
// jgn lupa ganti
const sendResetPasswordEmail = async (io, email, token) => {
  const domain = process.env.APP_URL
  const resetLink = `http:${domain}/api/v1/password/reset-password/${email}/${token}`;
  const linkTC= `${domain}/api/v1/password/reset-password/${email}/${token}`;

  const mailOptions = {
    from: '"Binarian" <your-email@gmail.com>', // Pengirim
    to: email, // Penerima
    subject: 'Reset Password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
      <center>  
      <h2>Reset Password</h2>
        <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
        <p>Silakan klik link di bawah untuk mereset password Anda:</p>
        <a 
          href="${resetLink}" 
          style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;"
        >
          Reset Password
        </a>
        <p>Atau salin dan tempel link ini ke postman atau thunderclient Anda:</p>
        <p>${linkTC}</p>
        <br />
        <p>Jika Anda tidak meminta penggantian password, abaikan email ini.</p>
        <p>Terima kasih,</p>
        <p>Binarian</p>
      </center>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    io.emit('userNotification', {
      message: `Email reset password telah dikirim ke ${email}`,
    });

    console.log('Email reset password berhasil dikirim.');
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    throw new Error('Tidak dapat mengirim email.');
  }
};

module.exports = sendResetPasswordEmail;