import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { Injectable } from '@nestjs/common';

const scrypt = promisify(scryptCallback);
const SCRYPT_KEYLEN = 64;

@Injectable()
export class PasswordHasherService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;

    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, expectedHex] = storedHash.split('$');

    if (algorithm !== 'scrypt' || !salt || !expectedHex) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, SCRYPT_KEYLEN)) as Buffer;
    const expectedKey = Buffer.from(expectedHex, 'hex');

    if (derivedKey.length !== expectedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, expectedKey);
  }
}
