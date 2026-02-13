import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerFormSchema, type RegisterFormValues } from '../model/register-form.schema';
import { useRegisterMutation } from '../model/use-register.mutation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui';

const roleOptions = [
  { label: '상담사', value: 'counselor' },
  { label: '관리자', value: 'admin' },
] as const;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState, reset } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'counselor',
    },
  });

  const mutation = useRegisterMutation(() => {
    reset();
    navigate('/login');
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">사용자 계정 생성</CardTitle>
        <CardDescription>
          관리자 또는 상담사 권한으로 등록할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="admin@example.com" {...register('email')} />
            {formState.errors.email && (
              <p className="text-xs text-rose-600">{formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="8자 이상 + 특수문자 1개 이상"
              {...register('password')}
            />
            {formState.errors.password && (
              <p className="text-xs text-rose-600">{formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" type="text" placeholder="운영자 이름" {...register('name')} />
            {formState.errors.name && (
              <p className="text-xs text-rose-600">{formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">권한</Label>
            <select
              id="role"
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700"
              {...register('role')}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formState.errors.role && (
              <p className="text-xs text-rose-600">{formState.errors.role.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '등록 중...' : '사용자 등록'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          이미 계정이 있다면{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            로그인
          </Link>
          으로 이동하세요.
        </p>
      </CardContent>
    </Card>
  );
};
