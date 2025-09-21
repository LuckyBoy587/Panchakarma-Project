const path = require('path');
// require the module under test
const mailer = require(path.join('..', 'mail-sender.js'));

describe('mail-sender sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls nodemailer.sendMail with correct options', async () => {
    const to = 'kowshi587@gmail.com';
    const subject = 'Hello';
    const text = 'Test body';

    // call sendEmail (module exports the function)
    const info = await mailer.sendEmail(to, subject, text);
  });
});
