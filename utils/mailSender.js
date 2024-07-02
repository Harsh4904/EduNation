const nodemailer=require("nodemailer");

const mailSender= async function(email,title,body) {
    try {
        let transporter= nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            }
        });

        let info= await transporter.sendMail({
            from: 'EduNation ~ by Harry',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log(info);
        return info;
    }

    catch(error) {
        console.log(error);
        throw error;
    }
}

module.exports= mailSender;