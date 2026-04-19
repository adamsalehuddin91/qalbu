# Qalbu n8n Setup

## 1. Import Workflow
n8n dashboard → **Import from file** → pilih `qalbu-ingest-workflow.json`

## 2. Set Environment Variables (n8n Settings → Variables)
```
QALBU_API_URL    = https://api.qalbu.yourdomain.com
QALBU_N8N_TOKEN  = (sama dengan N8N_INGEST_TOKEN dalam Laravel .env)
SUNNAH_API_KEY   = (free dari sunnah.com/api — daftar di sunnah.com)
```

## 3. Add Gemini Credentials
n8n → Credentials → New → **Google Gemini API**
- Paste Google AI Studio API key (aistudio.google.com)

## 4. Webhook URL (untuk Telegram push)
Selepas activate workflow, copy webhook URL:
```
https://your-n8n.domain.com/webhook/qalbu-ingest
```

Payload format untuk push manual:
```json
{ "content": "teks wisdom", "source": "Nama Sumber" }
```

## 5. Test Manual
- Buka workflow → klik **Execute Workflow**
- Check Laravel: `php artisan tinker --execute="echo App\Models\Wisdom::count();"`

## Flow

```
[Cron 6h] ──→ [Sunnah.com API]  ──→ [Normalize] ──→ [Gemini AI] ──→ [Parse+Hash] ──→ [POST Laravel] ──→ [Log]
           └─→ [Al-Quran Cloud] ──↗
[Webhook]  ────────────────────────────────────────────────────────────────────────────────────────────↗
```

Setiap cron cycle = 2 items masuk (1 hadith + 1 ayat) → Gemini process serentak → ingest ke DB.
Duplicate auto-skip via SHA256 content_hash.
