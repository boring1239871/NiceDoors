import { client, ApiResponse } from '../client';
import { UserProfile } from '../../types';

export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: () => {
    return client.get<UserProfile>('/user/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<UserProfile>) => {
    return client.put<UserProfile>('/user/profile', data);
  }
};
