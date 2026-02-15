import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
import { loginFormSchema, type LoginFormValues } from '../model/login-form.schema';
import { useLoginMutation } from '../model/use-login.mutation';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useLoginMutation(() => {
    navigate('/dashboard');
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">관리자 로그인</CardTitle>
        <CardDescription>관리자 페이지 접근을 위해 로그인해 주세요.</CardDescription>
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
            <Input id="password" type="password" placeholder="비밀번호 입력" {...register('password')} />
            {formState.errors.password && (
              <p className="text-xs text-rose-600">{formState.errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          계정이 없다면{' '}
          <Link to="/register" className="font-medium text-slate-900 underline">
            사용자 등록
          </Link>
          을 진행하세요.
        </p>
      </CardContent>
    </Card>
  );
};

