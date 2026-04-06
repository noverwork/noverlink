import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type {
  ApiError,
  AuthResponse,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  UserProfile,
} from '../api';
import { authApi } from '../api';
import { authStore } from '../auth-store';

export const AUTH_QUERY_KEY = ['auth', 'profile'];

class RefreshTokenMissingError extends Error implements ApiError {
  statusCode = 401;
  error = 'Unauthorized';

  constructor() {
    super('No refresh token');
  }
}

function handleAuthSuccess(response: AuthResponse): void {
  authStore.setTokens(response.accessToken, response.refreshToken);
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<AuthResponse, ApiError, LoginDto>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate('/videos');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<AuthResponse, ApiError, RegisterDto>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate('/videos');
    },
  });
}

export function useProfile() {
  return useQuery<UserProfile, ApiError>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getProfile,
    enabled: authStore.isAuthenticated(),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, ApiError, UpdateProfileDto>({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ApiError, void>({
    mutationFn: async () => {
      const refreshToken = authStore.getRefreshToken();
      if (!refreshToken) {
        throw new RefreshTokenMissingError();
      }
      return authApi.refresh(refreshToken);
    },
    onSuccess: (data) => {
      handleAuthSuccess(data);
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
    onError: () => {
      authStore.clearTokens();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    authStore.clearTokens();
    queryClient.clear();
    navigate('/login');
  };
}
