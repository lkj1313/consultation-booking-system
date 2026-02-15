import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './loading-spinner';

const meta = {
  title: 'Shared/LoadingSpinner',
  component: LoadingSpinner,
  args: {
    message: '인증 정보를 확인하고 있습니다...',
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongMessage: Story = {
  args: {
    message: '예약 가능한 시간대를 불러오는 중입니다. 잠시만 기다려 주세요.',
  },
};
