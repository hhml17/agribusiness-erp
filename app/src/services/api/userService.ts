import apiClient from '../../config/apiClient';
import type { UserProfile, UpdateUserProfileInput } from '../../types/user';

const BASE_PATH = '/api/users';

/**
 * User Profile API Service
 */
export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`${BASE_PATH}/profile`);
    return response.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: UpdateUserProfileInput): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(`${BASE_PATH}/profile`, data);
    return response.data;
  },
};
