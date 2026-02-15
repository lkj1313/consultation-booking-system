import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerFormSchema, type RegisterFormValues } from '../model/register-form.schema';
import { useRegisterMutation } from '../model/use-register.mutation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/shared/ui';

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
        <CardTitle className="text-xl">상담사 계정 생성</CardTitle>
        <CardDescription>상담사 권한 계정을 등록합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="counselor@example.com" {...register('email')} />
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
            <Input id="name" type="text" placeholder="상담사 이름" {...register('name')} />
            {formState.errors.name && (
              <p className="text-xs text-rose-600">{formState.errors.name.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '등록 중...' : '상담사 등록'}
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
