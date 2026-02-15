import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSessionStore } from '@/entities/user';
import { http } from '@/shared/api';
import { clearAccessToken } from '@/shared/lib/auth-token';

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      await http.post('/auth/logout');
    },
    onSuccess: () => {
      clearAccessToken();
      clearSession();
      queryClient.clear();
      toast.success('로그아웃되었습니다.');
      navigate('/login', { replace: true });
    },
    onError: () => {
      clearAccessToken();
      clearSession();
      toast.error('세션을 종료하고 로그인 화면으로 이동합니다.');
      navigate('/login', { replace: true });
    },
  });
};
