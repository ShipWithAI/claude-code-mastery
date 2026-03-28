---
title: 'Context bị lẫn'
description: 'Xử lý khi Claude Code bị lẫn context: triệu chứng, nguyên nhân và cách reset để phục hồi độ chính xác.'
---

# Module 8.3: Context bị lẫn

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 8.2 (Phát hiện & Phá vòng lặp)
>
> **Kết quả**: Sau module này, bạn sẽ nhận ra context confusion symptom, hiểu nguyên nhân, và biết khi nào cũng như cách dùng /compact và /clear để restore clarity.

---

## 1. WHY — Tại Sao Cần Hiểu

2 giờ vào session. Bạn bảo Claude update user service. Nó produce code reference API structure cũ bạn thảo luận 1 giờ trước — không phải cái mới bạn agree 30 phút trước. Bạn correct. Claude apologize và produce code reference CẢ HAI structure mix nhau. Giờ bạn còn confuse hơn trước.

Problem không phải Claude incompetent. Problem là **context confusion** — Claude đang cố satisfy contradictory info từ các điểm khác nhau trong conversation. Session dài tích lũy nhiều decision, thay đổi, và pivot. Không quản lý thì tạo ra "soup" context conflicting dẫn đến output inconsistent.

Ví von: Claude như người ghi chú trong cuộc họp dài. Sau 2 giờ, ghi chú đầy đủ nhưng khi tóm tắt, dễ nhầm lẫn quyết định giờ 1 với quyết định giờ 2.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Context Confusion Là Gì?

**Context confusion** = Claude mix info từ phần khác nhau của conversation:
- Dùng decision cũ khi có decision mới
- Blend detail từ file/feature khác nhau
- Apply pattern từ discussion này vào topic không liên quan
- KHÔNG phải quên — mà fail prioritize recent info over old

Khác với hallucination (bịa fact) và stuck loop (lặp action), context confusion involve thông tin THẬT từ conversation — chỉ là bị apply sai hoặc blend không đúng.

### Context Confusion vs Các Vấn Đề Khác

| Problem | Xảy ra gì | Symptom chính |
|---------|----------|---------------|
| Hallucination | Bịa fact | Info không trong conversation |
| Stuck loop | Lặp action | Same error/edit pattern |
| Context confusion | Mix up real info | Reference OLD hoặc MIXED decision |

### Nguyên Nhân

1. **Session dài** (2+ giờ dense work)
2. **Topic switch** (làm feature A, giờ làm B — confuse A và B)
3. **Contradictory update** ("Thực ra, đổi X thành Y" tạo tension giữa X cũ và Y mới)
4. **Multiple similar file** (nhầm `userService.ts` với `userController.ts`)
5. **Interrupted session** (quay lại sau break, context partially stale)

### Confusion Symptom

Watch for:
- Reference decision đã đổi hoặc bỏ
- Code dùng pattern từ earlier discussion (giờ đã superseded)
- Mix up file name hoặc component name
- Inconsistent naming trong cùng response
- "Mình đã decide..." khi thực ra chưa

### Prevention và Cure

**Prevention**:
- Proactive `/compact` trước topic switch
- Explicit statement: "Forget X, giờ làm Y"
- Periodic compaction trong long session

**Cure**:
- `/compact` để condense và clarify context
- `/clear` cho severe case (nuclear option)
- **Re-grounding**: Sau `/compact`, explicit re-state current state

### Khi Nào Dùng /compact

```
Claude reference old info? → /compact
Switch sang topic mới? → /compact trước
Session > 1 giờ dense work? → Proactive /compact
Code mix pattern từ discussion khác? → /compact + re-state
Severe confusion, không gì help? → /clear + fresh start
```

---

## 3. DEMO — Từng Bước

**Scenario**: Sau khi làm authentication, switch sang payment integration. Claude confuse auth pattern với payment pattern.

### Step 1: Observe Confusion Symptom

```
Bạn: Implement payment webhook handler.

Claude: Tôi sẽ tạo payment webhook handler. Dựa trên thảo luận
trước, tôi sẽ dùng JWT validation middleware...

[Claude produce code với JWT auth logic trong payment webhook]
```

**Problem**: Payment webhook dùng signature verification với secret key, không phải JWT. Claude đang mix auth context với payment context.

### Step 2: Confirm Confusion

```
Bạn: Payment webhook không dùng JWT. Nó dùng signature verification
với webhook secret. JWT là cho user auth, không phải webhook.

Claude: Đúng rồi, xin lỗi. Để tôi sửa...

[Claude produce code vẫn import JWT middleware NHƯNG cũng thêm
signature verification — MIXED approach]
```

**Worse**: Giờ nó blend cả hai approach. Correction không help — confusion quá deep.

### Step 3: Dùng /compact để Clear Confusion

```
/compact
```

Expected output:
```
Context compacted. Summary retained:
- Đang làm payment system integration
- Cần webhook handler cho payment notification
- Project dùng TypeScript, Express
```

### Step 4: Re-ground Sau Compact

```
Bạn: To be clear cho webhook handler:
- Đây là PAYMENT webhook (VNPay, Stripe), KHÔNG phải user auth
- Dùng signature verification với webhook secret
- Không JWT gì hết

Implement webhook handler.

Claude: Understood. Đây là payment webhook handler dùng signature
verification:

[Clean code với ONLY signature verification, không JWT confusion]
```

**Key technique**: `/compact` remove noise. Re-grounding ensure Claude có correct current context. Cùng nhau restore clarity.

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Induce và Fix Confusion

**Goal**: Experience context confusion firsthand và practice fix.

**Instructions**:
1. Start session, discuss approach A detail (ví dụ: REST API)
2. Pivot sang approach B (ví dụ: GraphQL) không /compact
3. Hỏi Claude implement gì đó — watch for A contamination trong B
4. Dùng `/compact` + re-grounding để fix

**Expected result**: Mixed pattern trước /compact, clean output sau.

<details>
<summary>💡 Hint</summary>

Confusion trigger tốt:
- "Dùng REST" → discuss 10 phút → "Thực ra dùng GraphQL"
- "Store trong PostgreSQL" → discuss → "Switch sang MongoDB"

Watch for: pattern cũ xuất hiện trong implementation mới, mixed terminology.
</details>

### Bài 2: Proactive Compaction

**Goal**: Practice prevent confusion trước khi xảy ra.

**Instructions**:
1. Work trên feature 30+ phút
2. Trước khi switch topic, run `/compact` proactively
3. Explicit state: "New topic: X. Topic trước Y done, đừng reference."
4. Compare: confusion có ít hơn không proactive?

**Expected result**: Cleaner transition, ít contamination từ topic trước.

### Bài 3: Re-grounding Drills

**Goal**: Tìm re-grounding phrasing work cho workflow của bạn.

**Instructions**:
1. Sau `/compact`, practice các phrasing khác nhau:
   - "To be clear: current state là..."
   - "Forget everything về X. Giờ làm Y với approach Z."
   - "Đây là gì matters NOW: [requirement]"
2. Note phrasing nào produce cleanest response

<details>
<summary>✅ Solution</summary>

**Most effective re-grounding pattern**:

Sau topic switch:
```
Topic trước (auth) COMPLETE. Đừng reference.
New topic: Payment processing.
Key fact:
- Webhook verification dùng HMAC signature
- Không JWT, không user token
- Framework: Express với raw body parsing
```

Sau confusion detected:
```
STOP. Clear assumption về file này.
Current truth:
- File: paymentWebhook.ts
- Purpose: Verify và process Stripe webhook
- Auth method: Signature verification ONLY
Start fresh với understanding này.
```
</details>

---

## 5. CHEAT SHEET

### Confusion Symptom

| Symptom | Action |
|---------|--------|
| Reference OLD decision | `/compact` |
| Mixed pattern từ discussion khác | `/compact` + re-ground |
| Inconsistent naming | Correct một lần; nếu lặp → `/compact` |
| "Mình đã decide..." (khi chưa) | Confusion confirmed → `/compact` |

### /compact Timing

- **Trước** major topic switch
- **Sau** 1 giờ dense work
- **Khi** thấy confusion symptom
- **Proactively** khi context cảm thấy "heavy"

### Re-grounding Template

Sau `/compact`:
```
"Current state: Đang implement [X] dùng [Y approach].
Discussion trước về [Z] không còn relevant.
Continue với [specific next step]."
```

```
"Forget [old topic]. New focus: [new topic].
Key constraint: [most important requirement]."
```

### /compact vs /clear

| Command | Effect | Khi nào dùng |
|---------|--------|--------------|
| `/compact` | Condense context, preserve key decision | First response cho confusion |
| `/clear` | Nuclear reset, mất everything | Khi `/compact` không help |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|--------------|
| Session dài không `/compact` | Proactive `/compact` mỗi giờ hoặc khi topic switch |
| `/clear` là first response cho confusion | Try `/compact` trước. `/clear` mất progress. |
| `/compact` không re-grounding | LUÔN re-state current context sau `/compact` |
| Assume Claude "nhớ" recent stuff tốt hơn | Recency không guarantee priority. Be explicit. |
| Không recognize confusion (blame Claude) | Mixed reference = confusion, không phải incompetence |
| Quá nhiều correction không reset | 3 correction cùng confusion? `/compact` time. |
| Switch topic không notice | Explicit: "Done với X. Giờ làm Y." |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Team Việt Nam build e-commerce platform. Dev làm product catalog 2 giờ, sau đó switch sang order processing. Claude cứ put product-related code vào order service.

**Symptom observed**:
- Order service import `ProductValidator`
- Order webhook check inventory (product concern, không phải order concern)
- Naming confusion: biến `productOrder` thay vì `order`
- Comment reference "catalog sync" trong order processing

**Diagnosis**: Context confusion từ long session + topic switch không compact.

**Fix applied**:

```
/compact
```

Sau đó:
```
New context: ONLY ORDER service now.
- Product catalog DONE, đừng reference
- Order service handle: checkout, payment, fulfillment
- Không product validation trong order service
- Không inventory check ở đây (đó là product domain)

Continue với order webhook handler.
```

**Result**: Clean order service code, không product contamination. Domain boundary rõ ràng.

**Team practice thêm**: "Switching domain? `/compact` first, sau đó state new context explicit. Team gọi là 'clean slate protocol.'"

**Time saved**: Ước tính 45 phút debug mixed concern, prevented bởi 30 giây `/compact` + re-grounding.

---

> **Tiếp theo**: [Module 8.4: Đánh giá chất lượng](../04-quality-assessment/) →
