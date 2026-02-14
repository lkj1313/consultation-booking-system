import { z } from 'zod';

export const registerFormSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해 주세요.')
    .email('올바른 이메일 형식을 입력해 주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해 주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(72, '비밀번호는 최대 72자까지 가능합니다.')
    .regex(/^(?=.*[^A-Za-z0-9\s]).+$/, '비밀번호에 특수문자를 최소 1개 포함해 주세요.'),
  name: z
    .string()
    .min(1, '이름을 입력해 주세요.')
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 최대 50자까지 가능합니다.'),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
