const fs = require('fs');
const { google } = require('googleapis');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Credenciais da conta de serviço
const credentials = {
  type: 'service_account',
  project_id: 'planilha-001',
  private_key_id: 'd34f0e55789ee03e5624d6a98df8c5bca77b3355',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDBLSGAat8R3sAP\nNtmca/Qc4nHhhoHeaoXzLDtamKXAMavnYF97hpkn2RLDUTy4cvgFRHNIZuADnh8j\ngw/4FILgaGqFLOaAV/mju/HjmBJ6eM1DZJyI9T+EFo/j2TyfVRsaV+SQIZt0fPzG\nSaJ89syhLe8MhDh0HcMK+6Ws7mvfDC9kUqhRNfiTh82TXo/ux4G1zzmZwnuDpbA9\nn3jcvlzVonnI6hfSUEBjAKY83LQ6kT7Xm2MMarP5bs2eus/rQ7/5Xra1PSZkEx2s\nFYKvRHRzuGsvuirvRjSgykYI2WlBKEMbyAcLuZmEp7f9nqk9Ml4V/lrZ/LW6Nohz\nTzRY5GC1AgMBAAECggEAAsfzDQW822WBD1cDUACv3YCXEh+dHAYdkpAm9Jlw/XDZ\noDWfekhISS4TWpN/U8p37p97J2YvwG2U1i6LWs90yOVH703jraJWmjhY9aVZUsEN\nd3Rp2oDpXq3yeV3FxSd1Ae6VAEwzkDxCaVpjB/iHnqRqJhx7MZTCG5Te4Dv4epgM\nZjtUILvpuoWG9mpPUAF1XzpX9Q84+prZnhxnEot128qCbPkyOpbL2iNESsbFjW4X\nj711XBtJaW8igKnSf+mWEcYACECGF5jvJa3mwZtROqgszv28iLU9gx1Wnr7zVFou\n6Xaa0AFaOoZ3C5V1hI8Kwq87bvCONLsIaiCxw8kOoQKBgQDstYVTe/DT6IuwZeLS\neZlT7gaIcpy6ER/HjAbHCZVRpARj/NUEhLmZnHhEuvNrA5NxOj09YckZ3BFfpPRw\nj7TNwvVnRw/RUbf2xaM/9A1Ujc0v70MDo7HSgHGYJzhgCCWOcSNxN2tIxc9oz0po\n57VjL2JKxaWnF5L+TpzmT+NnsQKBgQDQ62HsN+M0BAwgcwFxq8emM07QhJJpuAeu\nGNUEDVoLiFfjMuIlZ6EdF+ZHuCj1lyOFNxIlyNhFIOEtdDE7end7Iv4NSwZNk8X9\nWxro6ziGmoPdMNoL5+1R4suGG89pu+yFR5pV5rYr4LVsm2cUx9ZusoQnXgJc1iBy\noTUdePnORQKBgEFQGLifUyT1Xk3O3xYaLT9mRvExRqNkhDNIJLqYn1XGftuj8Jbt\nlFSZQuob93xIoU81tZ4RNC7pdPXCCxxf2pCHwbS8e9XSyYLSp6fGzELPWZVnXENN\n0Iv3muBTug9tUAeMmi3sD7MluYP+5lYp0PfMJD/jZ0DClXGL+WjnFCURAoGAZ6yH\nGXvaadOgWPH5Q3llR9qqP9up9IB4fzKfcrVVe+ebBYoYo0s7rn5PrkN7P/RSkib0\nAIAcoqFgXPgN/mAVrqt8uwgCBrlQRRvSzMb9c/51dWxqqAHdyQbszI48bVHuW21e\n70XgHQITxeOQUcWhaal43zhNn9g6nefVvdxsyqkCgYBX4o5mic0d6RV+B0FcPTy1\nVKapYt0LeoiILEmJNJijoCVe4sAux06bnAtEj0pDPrl5J0NtIeIItJFYs3CBlFHF\nsqqkBxHPouGfgPUqZhk1HhSIYXmBGy/jWbHrdk6Oj7/SKEUhn/fS/I45BWpIDwxw\n9a5c618YLyLBnFs1mXQiGA==\n-----END PRIVATE KEY-----\n',
  client_email: 'panilhapeci@planilha-001.iam.gserviceaccount.com',
  client_id: '114209371538589539772',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/panilhapeci%40planilha-001.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

// Configurar autenticação JWT
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// ID da planilha e o intervalo
const spreadsheetId = '1cMduJMAwqtCFbclahXdONEzsZ9OVPxp3bQRBMb098xs'; // Substitua pelo ID da sua planilha
const range = 'Dados!A:C'; // Substitua pelo intervalo onde deseja inserir os dados

// Endpoint para receber os dados do formulário
app.post('/submit', async (req, res) => {
  const { id, name, email } = req.body;

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: [[id, name, email]],
      },
    });
    res.status(200).send('Dados enviados com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao enviar dados');
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
