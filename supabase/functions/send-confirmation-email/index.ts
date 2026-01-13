import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  username: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HabitFlow <onboarding@resend.dev>",
        to: [email],
        subject: "Confirmez votre adresse email - HabitFlow",
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px 40px; text-align: center;">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); border-radius: 16px; margin: 0 auto 24px auto; line-height: 64px;">
                <span style="font-size: 28px;">✓</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b; line-height: 1.3;">
                Bienvenue sur HabitFlow !
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #52525b;">
                Bonjour <strong style="color: #18181b;">${username || 'ami'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #52525b;">
                Merci de vous être inscrit ! Pour commencer à transformer vos habitudes, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${confirmationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.4);">
                      Confirmer mon email
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                Ce lien expire dans 24 heures.
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 0;">
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa;">
                Si vous n'avez pas créé de compte, ignorez simplement cet email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                © ${new Date().getFullYear()} HabitFlow. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Alt Link -->
        <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                Bouton non fonctionnel ? Copiez ce lien dans votre navigateur :<br>
                <a href="${confirmationUrl}" style="color: #8b5cf6; word-break: break-all;">${confirmationUrl}</a>
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Confirmation email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
