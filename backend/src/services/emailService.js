const nodemailer = require('nodemailer');

// Preconfigured transporter template (Would use SendGrid keys in production)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'dummy_user@ethereal.email',
    pass: 'dummy_pass'
  }
});

exports.sendEmail = async (to, subject, text, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: '"AXIS Portal" <admin@axiscampus.com>',
      to: to,
      subject: subject,
      text: text,
      html: htmlContent || `<p>${text}</p>`
    });
    console.log(`Email successfully routed. Preview locally at Ethereal: ${nodemailer.getTestMessageUrl(info) || 'Mocked'}`);
    return true;
  } catch (error) {
    console.log("Mock Email Sent (No ethereal account found)");
    return true;
  }
};
