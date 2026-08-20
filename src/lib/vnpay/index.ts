import crypto from "crypto";

// VNPay Sandbox integration. Signature = HMAC-SHA512 over the sorted,
// URL-encoded query string (excluding vnp_SecureHash itself).
// Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  payUrl: string; // e.g. https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  returnUrl: string; // public return URL for UX
  ipnUrl?: string;
}

export function getVnpayConfig(): VnpayConfig {
  const {
    VNPAY_TMN_CODE,
    VNPAY_HASH_SECRET,
    VNPAY_PAY_URL,
    VNPAY_RETURN_URL,
    VNPAY_IPN_URL,
  } = process.env;

  if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET || !VNPAY_PAY_URL || !VNPAY_RETURN_URL) {
    throw new Error(
      "Missing VNPay env vars: VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_PAY_URL, VNPAY_RETURN_URL"
    );
  }

  return {
    tmnCode: VNPAY_TMN_CODE,
    hashSecret: VNPAY_HASH_SECRET,
    payUrl: VNPAY_PAY_URL,
    returnUrl: VNPAY_RETURN_URL,
    ipnUrl: VNPAY_IPN_URL,
  };
}

// VNPay requires spaces encoded as "+" (application/x-www-form-urlencoded),
// which is what URLSearchParams produces. Keys are sorted ascending.
function buildSignData(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined)
    .sort();
  const usp = new URLSearchParams();
  for (const key of sorted) usp.append(key, params[key]);
  return usp.toString();
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export interface CreatePaymentUrlInput {
  amount: number; // integer VND (NOT ×100 yet — we multiply here)
  orderId: string; // vnp_TxnRef — must be unique per payment attempt
  orderInfo: string;
  ipAddr: string;
  bankCode?: string;
  locale?: "vn" | "en";
  createDate?: Date;
}

function formatDate(date: Date): string {
  // VNPay requires GMT+7 (docs: "Time zone GMT+7"), format yyyyMMddHHmmss.
  const tz = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${tz.getUTCFullYear()}${p(tz.getUTCMonth() + 1)}${p(tz.getUTCDate())}` +
    `${p(tz.getUTCHours())}${p(tz.getUTCMinutes())}${p(tz.getUTCSeconds())}`
  );
}

export function createPaymentUrl(
  input: CreatePaymentUrlInput,
  config: VnpayConfig = getVnpayConfig()
): string {
  const now = input.createDate ?? new Date();
  const createDate = formatDate(now);
  // VNPay requires vnp_ExpireDate (GMT+7, yyyyMMddHHmmss); standard expiry is 15 min.
  const expireDate = formatDate(new Date(now.getTime() + 15 * 60 * 1000));

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: input.locale ?? "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.orderId,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: String(Math.round(input.amount) * 100), // VNPay expects ×100
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: input.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };
  if (input.bankCode) params.vnp_BankCode = input.bankCode;

  // Append the UI locale to the return URL so the VNPay return handler can
  // redirect the browser back to the correct /{locale}/booking result page.
  // VNPay keeps any pre-existing query string on vnp_ReturnUrl and appends
  // its own vnp_* params.
  const returnUrl = new URL(config.returnUrl);
  returnUrl.searchParams.set("locale", input.locale ?? "vn");
  params.vnp_ReturnUrl = returnUrl.toString();

  const signData = buildSignData(params);
  const secureHash = sign(signData, config.hashSecret);

  const query = new URLSearchParams();
  for (const key of Object.keys(params).sort()) query.append(key, params[key]);
  query.append("vnp_SecureHash", secureHash);

  return `${config.payUrl}?${query.toString()}`;
}

export interface VerifyResult {
  valid: boolean;
  amountVnd: number; // divided back down from ×100
  txnRef: string;
  responseCode: string;
  transactionStatus: string;
  isSuccess: boolean;
}

/**
 * Verify signature over returned params (Return URL or IPN).
 * Pass the raw query params object (all string values).
 */
export function verifyReturn(
  query: Record<string, string>,
  config: VnpayConfig = getVnpayConfig()
): VerifyResult {
  const received = query.vnp_SecureHash ?? "";
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (k === "vnp_SecureHash" || k === "vnp_SecureHashType") continue;
    params[k] = v;
  }

  const signData = buildSignData(params);
  const expected = sign(signData, config.hashSecret);

  const valid = timingSafeEqual(received, expected);
  const responseCode = query.vnp_ResponseCode ?? "";
  const transactionStatus = query.vnp_TransactionStatus ?? "";

  return {
    valid,
    amountVnd: Math.round(Number(query.vnp_Amount ?? "0") / 100),
    txnRef: query.vnp_TxnRef ?? "",
    responseCode,
    transactionStatus,
    isSuccess: valid && responseCode === "00" && transactionStatus === "00",
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8");
  const bb = Buffer.from(b, "utf-8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// VNPay IPN response codes the merchant returns back to VNPay.
export const IPN_RESPONSE = {
  SUCCESS: { RspCode: "00", Message: "Confirm Success" },
  ORDER_NOT_FOUND: { RspCode: "01", Message: "Order not found" },
  ALREADY_CONFIRMED: { RspCode: "02", Message: "Order already confirmed" },
  INVALID_AMOUNT: { RspCode: "04", Message: "Invalid amount" },
  INVALID_SIGNATURE: { RspCode: "97", Message: "Invalid signature" },
  UNKNOWN: { RspCode: "99", Message: "Unknown error" },
} as const;
