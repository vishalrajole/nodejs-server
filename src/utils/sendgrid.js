const sgMail = require("@sendgrid/mail");

const sendgridAPIKey = process.env.SENDGRID_API_KEY;
console.log("sendgridAPIKey", sendgridAPIKey);

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeMail = ({ email, name }) => {
  sgMail.send({
    to: email,
    from: "vishalrajole1991@gmail.com",
    subject: "Welcome to Task Manager",
    // text: `Welcome to the app ${name}.`,
    html: `Welcome to the app <strong>${name}</strong>.`,
  });
};

const sendCancelationMail = ({ email, name }) => {
  sgMail.send({
    to: email,
    from: "vishalrajole1991@gmail.com",
    subject: "Sorry to see you leave Task Manager",
    html: `Bye Bye <strong>${name}</strong>.`,
  });
};

module.exports = {
  sendWelcomeMail,
  sendCancelationMail,
};
