const { z } = require('zod');

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const details = issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }
  req.body = result.data;
  next();
};

const registerSchema = z.object({
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^01[3-9]\d{8}$/, 'Phone must be a valid 11-digit Bangladeshi number (e.g. 017XXXXXXXX)'),
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be 100 characters or fewer'),
  pin: z
    .string({ required_error: 'PIN is required' })
    .regex(/^\d{4,6}$/, 'PIN must be between 4 and 6 digits'),
  provider: z
    .enum(['bKash', 'Nagad', 'Rocket'], {
      errorMap: () => ({ message: 'Provider must be one of bKash, Nagad, Rocket' }),
    })
    .optional(),
});

const loginSchema = z.object({
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^01[3-9]\d{8}$/, 'Phone must be a valid 11-digit Bangladeshi number (e.g. 017XXXXXXXX)'),
  pin: z
    .string({ required_error: 'PIN is required' })
    .regex(/^\d{4,6}$/, 'PIN must be between 4 and 6 digits'),
});

const transferSchema = z.object({
  recipientPhone: z
    .string({ required_error: 'Recipient phone number is required' })
    .regex(/^01[3-9]\d{8}$/, 'Recipient phone must be a valid 11-digit Bangladeshi number (e.g. 017XXXXXXXX)'),
  fromWalletProvider: z.enum(['bKash', 'Nagad', 'Rocket'], {
    errorMap: () => ({ message: 'fromWalletProvider must be one of bKash, Nagad, Rocket' }),
  }),
  toWalletProvider: z.enum(['bKash', 'Nagad', 'Rocket'], {
    errorMap: () => ({ message: 'toWalletProvider must be one of bKash, Nagad, Rocket' }),
  }),
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .finite('Amount must be a finite number'),
  recipientName: z.string().optional(),
  pin: z.string().optional(),
  senderId: z.any().optional(), // Silently tolerated if sent by legacy clients, but ignored by backend to prevent IDOR
}).passthrough();

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  transferSchema,
};
