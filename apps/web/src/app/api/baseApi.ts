import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  AuthTokensDto,
  CreateSubscriberSourceRequest,
  CreateTopicRequest,
  LoginRequest,
  OAuthConnectionDto,
  RegisterRequest,
  SubscriberHistoryPageDto,
  SubscriberSourceDto,
  TopicDto,
  UpdateProfileRequest,
  UserDto,
  YouTubeChannelMetricsDto,
  YouTubeVideoMetricsDto,
} from '@spt/shared'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Topics', 'OAuthConnections', 'Me', 'SubscriberSources'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthTokensDto, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthTokensDto, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<UserDto, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    updateProfile: builder.mutation<UserDto, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    getTopics: builder.query<TopicDto[], void>({
      query: () => '/topics',
      providesTags: ['Topics'],
    }),
    createTopic: builder.mutation<TopicDto, CreateTopicRequest>({
      query: (body) => ({
        url: '/topics',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Topics'],
    }),
    getOAuthConnections: builder.query<OAuthConnectionDto[], void>({
      query: () => '/oauth/connections',
      providesTags: ['OAuthConnections'],
    }),
    getYouTubeMetrics: builder.query<YouTubeVideoMetricsDto, string>({
      query: (url) => `/youtube/metrics?url=${encodeURIComponent(url)}`,
    }),
    getYouTubeChannelMetrics: builder.query<YouTubeChannelMetricsDto, string>({
      query: (input) =>
        `/youtube/channel?input=${encodeURIComponent(input)}`,
    }),
    getYouTubeChannelsMetrics: builder.query<
      YouTubeChannelMetricsDto[],
      string[]
    >({
      query: (inputs) => {
        const params = new URLSearchParams()
        for (const input of inputs) {
          params.append('input', input)
        }
        return `/youtube/channels?${params.toString()}`
      },
    }),
    getSubscriberSources: builder.query<SubscriberSourceDto[], void>({
      query: () => '/subscribers/sources',
      providesTags: ['SubscriberSources'],
    }),
    createSubscriberSource: builder.mutation<
      SubscriberSourceDto,
      CreateSubscriberSourceRequest
    >({
      query: (body) => ({
        url: '/subscribers/sources',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SubscriberSources'],
    }),
    syncSubscriberSources: builder.mutation<SubscriberSourceDto[], void>({
      query: () => ({
        url: '/subscribers/sync',
        method: 'POST',
      }),
      invalidatesTags: ['SubscriberSources'],
    }),
    getSubscriberHistory: builder.query<
      SubscriberHistoryPageDto,
      { sourceId: string; cursor?: string }
    >({
      query: ({ sourceId, cursor }) => {
        const params = new URLSearchParams()
        if (cursor) params.set('cursor', cursor)
        const qs = params.toString()
        return `/subscribers/sources/${sourceId}/history${qs ? `?${qs}` : ''}`
      },
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetTopicsQuery,
  useCreateTopicMutation,
  useGetOAuthConnectionsQuery,
  useLazyGetYouTubeMetricsQuery,
  useLazyGetYouTubeChannelMetricsQuery,
  useLazyGetYouTubeChannelsMetricsQuery,
  useGetSubscriberSourcesQuery,
  useCreateSubscriberSourceMutation,
  useSyncSubscriberSourcesMutation,
  useLazyGetSubscriberHistoryQuery,
} = baseApi
