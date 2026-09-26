const Brevo = require("@getbrevo/brevo");

const sendEmail = async ({ to, subject, html }) => {
  const apiKey = (process.env.BREVO_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  const senderEmail = (process.env.EMAIL_ID || "").trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    console.warn("⚠️ Brevo Warning: BREVO_API_KEY is not defined or empty in .env.local.");
    return;
  }

  if (!senderEmail) {
    console.warn("⚠️ Brevo Warning: EMAIL_ID is not defined or empty in .env.local.");
    return;
  }

  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    console.log(`📧 Dispatching email to: ${to} (Sender: ${senderEmail})`);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: "ATELIER & CO.",
      email: senderEmail,
    };
    sendSmtpEmail.to = [{ email: to }];

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully via Brevo. Message ID:", result?.body?.messageId || "sent");
  } catch (error) {
    const status = error.response?.statusCode || error.status || error.response?.status;
    const errorBody = error.response?.body || error.message;

    console.error(`❌ Brevo Error (Status ${status}):`, errorBody);

    if (status === 401) {
      console.error(
        "\n==================== BREVO 401 UNAUTHORIZED GUIDE ====================\n" +
        "1. Your BREVO_API_KEY in .env.local was rejected by Brevo's API server.\n" +
        "2. Make sure you are using a Brevo v3 API Key (starts with 'xkeysib-...').\n" +
        "   - Go to: Brevo Dashboard > Top Right Profile Menu > SMTP & API > API Keys tab\n" +
        "   - Click 'Generate a new API key' and copy the entire string.\n" +
        "   - Note: Do NOT use the SMTP master password from the SMTP tab; use the API Key.\n" +
        "3. Ensure EMAIL_ID in .env.local matches a verified sender in Brevo (Senders & IP).\n" +
        "======================================================================\n"
      );
    }
  }
};

module.exports = sendEmail;
