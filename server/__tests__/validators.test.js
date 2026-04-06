const validators = require('../services/validators');

describe('validators', () => {
  it('isValidIsoDate', () => {
    expect(validators.isValidIsoDate('2026-04-06')).toBe(true);
    expect(validators.isValidIsoDate('2026-13-01')).toBe(false);
    expect(validators.isValidIsoDate('bad')).toBe(false);
  });

  it('isValidPhone', () => {
    expect(validators.isValidPhone('+15551234567')).toBe(true);
    expect(validators.isValidPhone('5551234567')).toBe(true);
    expect(validators.isValidPhone('1234567')).toBe(false);
    expect(validators.isValidPhone('+0123')).toBe(false);
  });

  it('isValidPatientName', () => {
    expect(validators.isValidPatientName('Jo')).toBe(true);
    expect(validators.isValidPatientName('J')).toBe(false);
  });
});
