import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  createPaymentUrl,
  verifyReturn,
  IPN_RESPONSE,
  type VnpayConfig,
} from "@/lib/vnpay";

const config: VnpayConfig = {
  tmnCode: "TESTTMN",
  hashSecret: "test-hash-secret-123456",
  payUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  returnUrl: "http://localhost:3000/api/payments/vnpay/return",
};

describe("vnpay lib", () => {
  it("creates a payment URL with v2.1.0 params and a valid signature", () => {
    const url = createPaymentUrl(
      {
        amount: 3_408_000,
        orderId: "JAS-ABC123-1",
        orderInfo: "Thanh toan don JAS-ABC123",
        ipAddr: "127.0.0.1",
      },
      config
    );

    const parsed = new URL(url);
    const params = Object.fromEntries(parsed.searchParams.entries());

    assert.equal(parsed.origin + parsed.pathname, config.payUrl);
    assert.equal(params.vnp_Version, "2.1.0");
    assert.equal(params.vnp_Command, "pay");
    assert.equal(params.vnp_TmnCode, config.tmnCode);
    assert.equal(params.vnp_CurrCode, "VND");
    assert.equal(params.vnp_TxnRef, "JAS-ABC123-1");
    // VNPay wants the amount ×100
    assert.equal(params.vnp_Amount, "340800000");
    assert.ok(params.vnp_SecureHash, "has a signature");
  });

  it("verifies a genuine Return/IPN callback as valid + success", () => {
    const txnRef = "JAS-ABC123-1";
    // Reconstruct the exact query VNPay would send back (signed).
    const unsigned: Record<string, string> = {
      vnp_Amount: "340800000",
      vnp_BankCode: "NCB",
      vnp_OrderInfo: "Thanh toan don JAS-ABC123",
      vnp_ResponseCode: "00",
      vnp_TmnCode: config.tmnCode,
      vnp_TransactionNo: "12345678",
      vnp_TransactionStatus: "00",
      vnp_TxnRef: txnRef,
      vnp_Version: "2.1.0",
      vnp_SecureHashType: "SHA512",
    };

    // Build the same sign data the lib does (sorted, URL-encoded).
    const sorted = Object.keys(unsigned)
      .filter((k) => k !== "vnp_SecureHash" && k !== "vnp_SecureHashType")
      .filter((k) => unsigned[k] !== "")
      .sort();
    const usp = new URLSearchParams();
    for (const k of sorted) usp.append(k, unsigned[k]);
    const hash = crypto
      .createHmac("sha512", config.hashSecret)
      .update(Buffer.from(usp.toString(), "utf-8"))
      .digest("hex");

    const result = verifyReturn(
      { ...unsigned, vnp_SecureHash: hash },
      config
    );

    assert.equal(result.valid, true);
    assert.equal(result.txnRef, txnRef);
    assert.equal(result.amountVnd, 3_408_000);
    assert.equal(result.isSuccess, true);
  });

  it("rejects a tampered amount (tampered client price)", () => {
    const txnRef = "JAS-ABC123-1";
    const unsigned: Record<string, string> = {
      vnp_Amount: "340800000",
      vnp_ResponseCode: "00",
      vnp_TmnCode: config.tmnCode,
      vnp_TransactionStatus: "00",
      vnp_TxnRef: txnRef,
      vnp_Version: "2.1.0",
    };
    const sorted = Object.keys(unsigned).sort();
    const usp = new URLSearchParams();
    for (const k of sorted) usp.append(k, unsigned[k]);
    const hash = crypto
      .createHmac("sha512", config.hashSecret)
      .update(Buffer.from(usp.toString(), "utf-8"))
      .digest("hex");

    // Attacker changes the amount in the query but keeps the original hash.
    const tampered = verifyReturn(
      { ...unsigned, vnp_Amount: "1", vnp_SecureHash: hash },
      config
    );
    assert.equal(tampered.valid, false);
    assert.equal(tampered.isSuccess, false);
  });

  it("rejects an invalid signature (tampered secure hash)", () => {
    const result = verifyReturn(
      {
        vnp_Amount: "340800000",
        vnp_ResponseCode: "00",
        vnp_TxnRef: "JAS-ABC123-1",
        vnp_SecureHash: "deadbeef",
      },
      config
    );
    assert.equal(result.valid, false);
    assert.equal(result.isSuccess, false);
  });

  it("does not mark success when response code is non-zero", () => {
    const result = verifyReturn(
      {
        vnp_Amount: "340800000",
        vnp_ResponseCode: "24", // cancelled by user
        vnp_TxnRef: "JAS-ABC123-1",
        vnp_TransactionStatus: "24",
        vnp_SecureHash: "whatever",
      },
      config
    );
    // Signature invalid here, but importantly isSuccess requires 00/00.
    assert.equal(result.isSuccess, false);
    assert.equal(result.responseCode, "24");
  });

  it("exposes the correct IPN response codes", () => {
    assert.equal(IPN_RESPONSE.SUCCESS.RspCode, "00");
    assert.equal(IPN_RESPONSE.ORDER_NOT_FOUND.RspCode, "01");
    assert.equal(IPN_RESPONSE.ALREADY_CONFIRMED.RspCode, "02");
    assert.equal(IPN_RESPONSE.INVALID_AMOUNT.RspCode, "04");
    assert.equal(IPN_RESPONSE.INVALID_SIGNATURE.RspCode, "97");
  });
});
