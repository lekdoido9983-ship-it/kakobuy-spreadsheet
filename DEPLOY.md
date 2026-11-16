# Deploy no Fly.io + imagens no Cloudflare R2 (quase de graça)

Custo: Fly ≈ US$ 3–4/mês + domínio .com ≈ US$ 10/ano. R2, Cloudflare e Brevo no plano grátis.

## 1. Fly.io (site)
Não precisa de Docker local: o Fly constrói na nuvem. Só precisa do `flyctl`
(PowerShell: `iwr https://fly.io/install.ps1 -useb | iex`), se ainda não estiver no PATH desta máquina.
```bash
fly auth login
fly launch --no-deploy --copy-config --name SEU-NOME-UNICO --region iad
fly deploy \
  --build-arg NEXT_PUBLIC_SITE_URL=https://SEU-NOME-UNICO.fly.dev \
  --build-arg NEXT_PUBLIC_QC_BASE=https://img.SEUDOMINIO.com/q
```
Segredos (newsletter), se for usar:
```bash
fly secrets set NEWSLETTER_PROVIDER=brevo BREVO_API_KEY=... BREVO_LIST_ID=...
```
(e `--build-arg NEXT_PUBLIC_NEWSLETTER_ENABLED=true` no deploy)

## 2. Cloudflare R2 (fotos QC) — OPCIONAL
As fotos QC já vão dentro do site (`public/q`, ~62 MB) e funcionam sem R2. Use o R2 só se quiser
tirar o peso das imagens do servidor e servir tudo pelo cache da Cloudflare (recomendado para tráfego alto).
Sem `NEXT_PUBLIC_QC_BASE`, o site usa `/q` do próprio servidor.
1. Cloudflare → R2 → criar bucket `kakobuy-img`.
2. R2 → Manage API tokens → token com permissão Object Read & Write.
3. Subir as fotos (PowerShell, na pasta `export`):
```powershell
$env:R2_ACCOUNT_ID="..."; $env:R2_ACCESS_KEY_ID="..."; $env:R2_SECRET_ACCESS_KEY="..."; $env:R2_BUCKET="kakobuy-img"
node upload-r2.js
```
4. Bucket → Settings → Custom Domains → `img.SEUDOMINIO.com` (depois de comprar o domínio).
   Antes do domínio, use "Public Development URL" (r2.dev) como `NEXT_PUBLIC_QC_BASE`.

## 3. Domínio .com
Comprar na Cloudflare Registrar (preço de custo). Depois:
- `fly certs add SEUDOMINIO.com` e `fly certs add www.SEUDOMINIO.com`
- No DNS da Cloudflare: registros CNAME/A que o `fly certs show` indicar (proxy desligado até o certificado emitir).
- Refazer o deploy com `NEXT_PUBLIC_SITE_URL=https://SEUDOMINIO.com`.
