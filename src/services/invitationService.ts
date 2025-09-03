
import { Invitation, InvitationType } from '@/types/invitation';
import { UserRole } from '@/types/user';

class InvitationService {
  private invitations: Map<string, Invitation> = new Map();

  generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  async createInvitation(
    fromUserId: string,
    fromUserName: string,
    fromUserRole: UserRole,
    targetRole: UserRole,
    contact: { email?: string; phone?: string },
    type: InvitationType,
    message?: string
  ): Promise<Invitation> {
    const invitation: Invitation = {
      id: this.generateInviteToken(),
      fromUserId,
      fromUserName,
      fromUserRole,
      toEmail: contact.email,
      toPhone: contact.phone,
      targetRole,
      type,
      token: this.generateInviteToken(),
      referralCode: fromUserRole === 'doctor' ? this.generateReferralCode() : undefined,
      message,
      status: 'sent',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.invitations.set(invitation.id, invitation);
    
    // In a real app, this would send SMS/WhatsApp/Email
    console.log(`Invitation sent via ${type}:`, invitation);
    
    return invitation;
  }

  async validateInviteToken(token: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.token === token && invitation.status === 'sent' && invitation.expiresAt > new Date()) {
        return invitation;
      }
    }
    return null;
  }

  async validateReferralCode(code: string): Promise<Invitation | null> {
    for (const invitation of this.invitations.values()) {
      if (invitation.referralCode === code && invitation.status === 'sent' && invitation.expiresAt > new Date()) {
        return invitation;
      }
    }
    return null;
  }

  async acceptInvitation(token: string): Promise<boolean> {
    const invitation = await this.validateInviteToken(token);
    if (invitation) {
      invitation.status = 'accepted';
      return true;
    }
    return false;
  }
}

export const invitationService = new InvitationService();
