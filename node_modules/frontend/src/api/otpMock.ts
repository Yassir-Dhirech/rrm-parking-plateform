export interface SendOtpInput {
  recipient: string;
  channel: "SMS" | "EMAIL";
}

export interface VerifyOtpInput {
  recipient: string;
  code: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

// In-memory store for active OTP codes
const activeOtpStore: Record<string, string> = {};

export async function sendOtpMock(input: SendOtpInput): Promise<OtpResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Default demo OTP code is 123456
  const mockCode = "123456";
  activeOtpStore[input.recipient] = mockCode;

  const targetLabel = input.channel === "SMS" ? `SMS au ${input.recipient}` : `Email à ${input.recipient}`;
  return {
    success: true,
    message: `Code OTP envoyé avec succès par ${targetLabel}.`,
  };
}

export async function verifyOtpMock(input: VerifyOtpInput): Promise<OtpResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const storedCode = activeOtpStore[input.recipient] || "123456";
  if (input.code === storedCode || input.code === "123456") {
    delete activeOtpStore[input.recipient];
    return {
      success: true,
      message: "Vérification OTP réussie.",
    };
  }

  return {
    success: false,
    message: "Code OTP incorrect. Veuillez réessayer avec le code 123456.",
  };
}
