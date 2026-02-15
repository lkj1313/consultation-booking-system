import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/shared/ui';
import { useState } from 'react';
import { useSendBookingLinkMutation } from '@/features/send-booking-link';

export const BookingLinkSection = () => {
  const [targetName, setTargetName] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const sendBookingLinkMutation = useSendBookingLinkMutation();

  const submit = () => {
    const normalizedName = targetName.trim();
    const normalizedEmail = targetEmail.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail) {
      return;
    }
    sendBookingLinkMutation.mutate({
      targetName: normalizedName,
      targetEmail: normalizedEmail,
    });
  };

  const result = sendBookingLinkMutation.data;
  const formattedExpiresAt = result
    ? new Date(result.expiresAt).toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">예약 링크 이메일 발송</CardTitle>
        <CardDescription>
          신청자 이메일을 입력하면 예약 링크를 발송합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="booking-link-target-name">신청자 이름</Label>
            <Input
              id="booking-link-target-name"
              value={targetName}
              onChange={(event) => setTargetName(event.target.value)}
              placeholder="홍길동"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="booking-link-target-email">신청자 이메일</Label>
            <Input
              id="booking-link-target-email"
              type="email"
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              placeholder="applicant@example.com"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <Button
              className="w-full md:w-auto"
              disabled={sendBookingLinkMutation.isPending || !targetName.trim() || !targetEmail.trim()}
              onClick={submit}
            >
              {sendBookingLinkMutation.isPending ? '발송 중...' : '이메일 발송'}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-slate-700">이름: {result.targetName}</p>
            <p className="text-slate-700">수신자: {result.targetEmail}</p>
            <p className="text-slate-700">만료: {formattedExpiresAt}</p>
            <div className="space-y-1">
              <Label htmlFor="booking-link-result-url">발송 링크</Label>
              <Input id="booking-link-result-url" value={result.reservationUrl} readOnly />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
