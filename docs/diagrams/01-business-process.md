# 01 — Business process (As-Is / To-Be)

ai-speech-to-text-web (Voice Booth) คือหน้าเว็บฝั่ง client ที่ต่อ Web Speech API ของเบราว์เซอร์เข้ากับพื้นที่ transcript สำหรับผู้เยี่ยมชม portfolio บน Chrome/Edge ไม่มี key บริการถอดเสียง หรือ backend ของตัวเอง

Last reviewed: 2026-11-28 · commit `608bb1d`

## As-Is (จากโค้ดวันนี้)

```mermaid
flowchart TD
  OPEN["เปิดหน้าเว็บ: สถานะ READY ทุกเบราว์เซอร์ (ยังไม่ตรวจ API)"] --> READY["READY"]
  READY --> START["กด Start"]
  START --> DET{"window มี SpeechRecognition หรือ webkitSpeechRecognition?"}
  DET -->|"ไม่มี (เช่น Firefox; Safari ขึ้นกับรุ่น)"| UNAV["สถานะ UNAVAILABLE + ข้อความแนะนำ Chrome/Edge"]
  DET -->|"มี"| LISTEN["continuous + interim results; เบราว์เซอร์อาจขอสิทธิ์ไมค์ และอาจประมวลผลเสียงผ่านบริการของตน [ต้องยืนยัน: ต่างกันตามเบราว์เซอร์])"]
  LISTEN -->|"onresult"| TXT["joinTranscript อัปเดต transcript + นับคำ"]
  LISTEN -->|"onerror"| ERR["สถานะ ERROR"]
  LISTEN -->|"Stop หรือ onend"| STOP["สถานะ STOPPED"]
  TXT --> COPY["Copy: navigator.clipboard.writeText"]
  TXT --> CLEAR["Clear: ล้าง transcript; ถ้าไม่ได้ฟังอยู่กลับ READY; ถ้ากำลัง LISTENING ไม่หยุดฟัง ผลถัดไปเติม transcript กลับมาได้"]
  MCP["POST /api/mcp"] --> EMPTY["initialize และ tools/list (ว่าง) เท่านั้น; tools/call ถูกปฏิเสธ"]
```

Sources: `app/page.tsx`, `lib/speech.ts`, `app/api/mcp/route.ts`, `PRODUCT.md`

ข้อเท็จจริงจากโค้ด/เอกสาร:

- CI (`ci.yml`) ไม่มีขั้น deploy; deploy แยกต่างหาก (ดู G1)
- ไม่มีการอัด อัปโหลด หรือเก็บเสียง/transcript ที่ server; reload แล้วหาย; เสียงอาจถูกส่งไปบริการ speech ของเบราว์เซอร์ (เช่น Chrome) ซึ่งเป็นนอกแอป
- Copy วาง transcript ลง clipboard ของระบบ ซึ่งอาจค้างหลัง Clear (`PRODUCT.md` §Known limits)
- `/api/mcp` เป็น JSON-RPC แบบ stateless: error ทุกชนิด (รวม method/tool ไม่รู้จัก) ตอบ HTTP 400 พร้อม code JSON-RPC
- error ฝั่งเว็บและ server ที่ Sentry SDK จับได้ไป Sentry เมื่อมี `NEXT_PUBLIC_SENTRY_DSN` (`lib/sentry.ts`); เหตุการณ์ `onerror` ของตัวถอดเสียงตั้งแค่สถานะ ERROR ไม่ถูกรายงาน; `PRODUCT.md` ว่าตั้งบน Vercel แล้ว แต่ใช้ได้เมื่อ deploy ครั้งถัดไป [ต้องยืนยัน]

## To-Be

ไม่มี To-Be ที่เขียนไว้

## Gap

| ID | As-Is → To-Be | Status | Owner | Evidence |
|---|---|---|---|---|
| G1 | Vercel Git link ชี้ repo ชื่อเก่า push `main` จึงไม่ deploy (deploy ด้วย CLI เท่านั้น) → owner เชื่อม Vercel Git กับ repo นี้ | todo | owner | `PRODUCT.md` §Live URL and deploy state (owner action D9) |
| G2 | ไม่มี To-Be ของกระบวนการ → owner กำหนด (หรือยืนยันว่าแอปนี้คงขอบเขตปัจจุบัน) | decide | owner | ไม่มีใน `PRODUCT.md` / `docs/` |

## Open questions

- ตั้งค่า production ตาม `PRODUCT.md` ยังไม่ได้ deploy L2 (tests, Sentry, MCP ตรงความจริง) [ต้องยืนยัน]
