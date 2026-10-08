import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * هذه الاختبارات تتحقق من أن منطق تنبيه البنوك المرفوضة (الرياض/البلاد)
 * موجود في صفحة بيانات الدفع (Data.tsx) فقط، وتمت إزالته من صفحة البطاقة (CardPayment.tsx).
 */

const dataPage = readFileSync(
  resolve(__dirname, "../client/src/pages/steps/Data.tsx"),
  "utf-8"
);
const cardPage = readFileSync(
  resolve(__dirname, "../client/src/pages/steps/CardPayment.tsx"),
  "utf-8"
);

describe("تنبيه البنوك المرفوضة في صفحة بيانات الدفع", () => {
  it("يعرض شرط ظهور التنبيه عند اختيار بطاقة بنك الرياض أو البلاد", () => {
    expect(dataPage).toContain('bank === "بطاقة بنك الرياض"');
    expect(dataPage).toContain('bank === "بطاقة بنك البلاد"');
  });

  it("يستخدم صورتي البطاقتين الصحيحتين داخل التنبيه", () => {
    expect(dataPage).toContain("ASSETS.riyadBankCard");
    expect(dataPage).toContain("ASSETS.albiladBankCard");
  });

  it("يتضمن رسالة التنبيه بأن الدفع بهذه البطاقة لا يعمل", () => {
    expect(dataPage).toContain("لا يعمل حالياً");
  });
});

describe("صفحة البطاقة لا تحتوي منع أو تنبيه للبنوك", () => {
  it("لا يوجد منع في زر الإرسال لبنك الرياض/البلاد", () => {
    expect(cardPage).not.toContain('cardType?.bank === "riyad" || cardType?.bank === "albilad"');
  });

  it("لا تعرض صفحة البطاقة صور البطاقات المرفوضة", () => {
    expect(cardPage).not.toContain("ASSETS.riyadBankCard");
    expect(cardPage).not.toContain("ASSETS.albiladBankCard");
  });

  it("تبقي شروط القبول الأساسية: رقم بطاقة صحيح، تاريخ انتهاء، CVV", () => {
    expect(cardPage).toContain("cardValid");
    expect(cardPage).toContain("cvv.length < 3");
    expect(cardPage).toContain("منتهي الصلاحية");
  });
});
