const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: `${email}`,
    from: 'kb10j.kb@gmail.com',
    subject: "Welcome to the Application",
    text: `Thank you for joining, ${name}. Let me know how you get along with the app.`
  }).then((item) => {
    console.log("It succeeded")
  }).catch((err) => {
 
    console.log(err)
  }) 
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: `${email}`,
    from: 'kb10j.kb@gmail.com',
    subject: "Sorry to see you go",
    text: `We will miss you ${name}. Let us know if there is anything we can do.`
  }).then((item) => {
    console.log("It succeeded")
  }).catch((err) => {
 
    console.log(err)
  }) 
}

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
}