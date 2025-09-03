
import { UserRole } from './user';

export type InvitationType = 'sms' | 'whatsapp' | 'email';

export interface Invitation {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toEmail?: string;
  toPhone?: string;
  targetRole: UserRole;
  type: InvitationType;
  token: string;
  referralCode?: string;
  message?: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}
