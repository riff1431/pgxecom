import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface EncryptedData {
  encryptedText: string;
  iv: string;
  tag: string;
}

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Derive a consistent 256-bit (32 bytes) key from JWT_SECRET
    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'your-super-secret-jwt-key-change-in-production';

    // SHA-256 hash produces exactly 32 bytes suitable for aes-256-gcm
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * Encrypts plaintext using AES-256-GCM with a random 12-byte IV.
   */
  encrypt(plainText: string): EncryptedData {
    if (!plainText) {
      return { encryptedText: '', iv: '', tag: '' };
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
      tag: tag,
    };
  }

  /**
   * Decrypts ciphertext using AES-256-GCM.
   */
  decrypt(encryptedText: string, ivHex: string, tagHex: string): string {
    if (!encryptedText || !ivHex || !tagHex) {
      return '';
    }

    try {
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err: any) {
      this.logger.error(`Decryption failed: ${err.message}`);
      throw new Error('Failed to decrypt sensitive configuration data');
    }
  }

  /**
   * Masks secrets so they are never returned in plaintext to the UI.
   * e.g. "sk_test_51UGA...ryja" -> "sk_test_••••••••ryja"
   */
  maskSecret(value: string | null | undefined, prefixLen = 7, suffixLen = 4): string {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (trimmed.length <= prefixLen + suffixLen) {
      return '••••••••••••';
    }

    const prefix = trimmed.slice(0, prefixLen);
    const suffix = trimmed.slice(-suffixLen);
    return `${prefix}••••••••${suffix}`;
  }

  /**
   * Checks if input is a masked representation or empty placeholder
   */
  isMaskedOrEmpty(value: string | null | undefined): boolean {
    if (!value || typeof value !== 'string') return true;
    const trimmed = value.trim();
    return trimmed === '' || trimmed.includes('••') || trimmed.includes('••••');
  }
}
