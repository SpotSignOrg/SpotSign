export interface Keys {
  private_key: string;
  public_key: string;
}

export interface Signature {
  signature: string;
}

export interface Verification {
  verified: boolean;
  datetime?: string;
  error?: string;
}
