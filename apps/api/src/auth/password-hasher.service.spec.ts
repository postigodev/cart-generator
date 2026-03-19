import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    service = new PasswordHasherService();
  });

  it('hashes and verifies a password', async () => {
    const hash = await service.hash('s3cure-passphrase');

    await expect(service.verify('s3cure-passphrase', hash)).resolves.toBe(true);
    await expect(service.verify('wrong-passphrase', hash)).resolves.toBe(false);
  });
});
