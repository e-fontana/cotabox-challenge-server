export function generatePasswordResetTemplate(
  userName: string,
  resetToken: string,
) {
  return {
    subject: 'Recuperação de Senha',
    html: `
    <div style="width: 100%; background-color: #424242; padding: 20px; box-sizing: border-box;">
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e2e2; border-radius: 8px;">
        <img
          src="https://www.titanci.com.br/_next/static/media/LogoHeader.d28544ae.svg"
          alt="Logo"
          style="width: 150px; height: auto; margin-bottom: 20px;"
        />
        <h2 style="color: #e2e2e2;">Olá, ${userName}!</h2>
        <p style="color: #f2a900; font-weight: bold;">
          Você solicitou a recuperação de sua senha. Clique use o token abaixo para redefinir sua senha:
        </p>
        <p style="margin-top: 16px; color: #e2e2e2;">
          <span style="display: inline-block; word-break: break-all; overflow-wrap: break-word; color: #e2e2e2;">
            ${resetToken}
          </span>
        </p>
        <p style="margin-top: 24px; color: #e2e2e2;">
          Se você não solicitou essa alteração, ignore este e-mail.
        </p>
        <p style="font-weight: 800; color: #e2e2e2;">
          Obrigado,<br />
          Equipe SIMTechos! 🤖
        </p>
      </div>
    </div>
    `,
  };
}
