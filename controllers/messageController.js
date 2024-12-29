const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Pesan Baru dari ${name}`,
      html: `
        <h3>Detail Pesan:</h3>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>No HP:</strong> ${phone}</p>
        <p><strong>Pesan:</strong> ${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Pesan berhasil dikirim!'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim pesan.'
    });
  }
};

module.exports = {
  sendMessage
};
