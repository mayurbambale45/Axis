import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const axisApi = createApi({
  reducerPath: 'axisApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Events', 'Clubs', 'Registrations', 'Dashboard', 'Users', 'Notifications', 'Members', 'Roster', 'Applications'],
  endpoints: (builder) => ({

    /* ── EVENTS ─────────────────────────────────── */
    getEvents: builder.query({
      query: () => 'events',
      providesTags: ['Events']
    }),
    getClubEvents: builder.query({
      query: (clubId) => `clubs/${clubId}/events`,
      providesTags: ['Events']
    }),
    createEvent: builder.mutation({
      query: (payload) => ({ url: 'club-admin/events', method: 'POST', body: payload }),
      invalidatesTags: ['Events', 'Dashboard']
    }),
    updateEvent: builder.mutation({
      query: ({ clubId, eventId, ...fields }) => ({
        url: `clubs/${clubId}/events/${eventId}`,
        method: 'PATCH',
        body: fields
      }),
      invalidatesTags: ['Events']
    }),

    /* ── CLUBS ──────────────────────────────────── */
    getClubs: builder.query({
      query: () => 'clubs',
      providesTags: ['Clubs']
    }),
    createClub: builder.mutation({
      query: (payload) => ({ url: 'admin/clubs', method: 'POST', body: payload }),
      invalidatesTags: ['Clubs']
    }),
    getAdminClubs: builder.query({
      query: () => 'admin/clubs',
      providesTags: ['Clubs']
    }),

    /* ── CLUB MEMBERS ───────────────────────────── */
    getClubMembers: builder.query({
      query: (clubId) => `clubs/${clubId}/members`,
      providesTags: ['Members']
    }),
    addClubMember: builder.mutation({
      query: ({ clubId, user_id, club_role }) => ({
        url: `clubs/${clubId}/members`,
        method: 'POST',
        body: { user_id, club_role }
      }),
      invalidatesTags: ['Members']
    }),
    updateClubMemberRole: builder.mutation({
      query: ({ clubId, memberId, club_role }) => ({
        url: `clubs/${clubId}/members/${memberId}`,
        method: 'PATCH',
        body: { club_role }
      }),
      invalidatesTags: ['Members']
    }),
    removeClubMember: builder.mutation({
      query: ({ clubId, memberId }) => ({
        url: `clubs/${clubId}/members/${memberId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Members']
    }),

    /* ── EVENT ROSTER ───────────────────────────── */
    getEventRoster: builder.query({
      query: (eventId) => `club-admin/events/${eventId}/roster`,
      providesTags: ['Roster']
    }),

    /* ── REGISTRATIONS ──────────────────────────── */
    getStudentRegistrations: builder.query({
      query: (id) => `student/${id}/registrations`,
      providesTags: ['Registrations']
    }),
    registerForEvent: builder.mutation({
      query: ({ eventId, payload }) => ({
        url: `events/${eventId}/register`, method: 'POST', body: payload
      }),
      invalidatesTags: ['Registrations', 'Dashboard', 'Events']
    }),
    payForTicket: builder.mutation({
      query: (payload) => ({ url: 'student/pay', method: 'POST', body: payload }),
      invalidatesTags: ['Registrations', 'Dashboard']
    }),

    /* ── NOTIFICATIONS ──────────────────────────── */
    getStudentNotifications: builder.query({
      query: (userId) => `student/${userId}/notifications`,
      providesTags: ['Notifications']
    }),
    markNotificationRead: builder.mutation({
      query: (notifId) => ({ url: `student/notifications/${notifId}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications']
    }),
    markAllNotificationsRead: builder.mutation({
      query: (userId) => ({ url: `student/${userId}/notifications/read-all`, method: 'PATCH' }),
      invalidatesTags: ['Notifications']
    }),
    sendNotification: builder.mutation({
      query: (payload) => ({ url: 'club-admin/notify', method: 'POST', body: payload }),
      invalidatesTags: ['Notifications']
    }),
    getClubAdminNotifications: builder.query({
      query: () => 'club-admin/notifications',
      providesTags: ['Notifications']
    }),

    /* ── ADMIN / GOVERNANCE ─────────────────────── */
    getSuperAdminStats: builder.query({
      query: () => 'super-admin/stats',
      providesTags: ['Dashboard']
    }),
    getAdminNotifications: builder.query({
      query: () => 'admin/notifications',
      providesTags: ['Notifications']
    }),
    markAdminNotificationRead: builder.mutation({
      query: (notifId) => ({ url: `admin/notifications/${notifId}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications']
    }),

    getPendingUsers: builder.query({
      query: () => 'admin/users/pending',
      providesTags: ['Users']
    }),
    getAllUsers: builder.query({
      query: () => 'admin/users',
      providesTags: ['Users']
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `admin/users/${id}/status`, method: 'PATCH', body: { status }
      }),
      invalidatesTags: ['Users', 'Dashboard']
    }),
    updateUserRole: builder.mutation({
      query: ({ id, global_role }) => ({
        url: `admin/users/${id}/role`, method: 'PATCH', body: { global_role }
      }),
      invalidatesTags: ['Users']
    }),
    assignMemberToClub: builder.mutation({
      query: ({ clubId, user_id, club_role }) => ({
        url: `admin/clubs/${clubId}/assign-member`, method: 'POST', body: { user_id, club_role }
      }),
      invalidatesTags: ['Members', 'Users', 'Clubs']
    }),
    getAdminClubMembers: builder.query({
      query: (clubId) => `admin/clubs/${clubId}/members`,
      providesTags: ['Members']
    }),
    removeAdminClubMember: builder.mutation({
      query: ({ clubId, memberId }) => ({
        url: `admin/clubs/${clubId}/members/${memberId}`, method: 'DELETE'
      }),
      invalidatesTags: ['Members', 'Clubs']
    }),
    assignMentorToClub: builder.mutation({
      query: ({ userId, club_id }) => ({
        url: `admin/users/${userId}/assign-mentor-club`, method: 'POST', body: { club_id }
      }),
      invalidatesTags: ['Users', 'Clubs']
    }),
    removeMentorClub: builder.mutation({
      query: ({ userId, clubId }) => ({
        url: `admin/users/${userId}/assign-mentor-club/${clubId}`, method: 'DELETE'
      }),
      invalidatesTags: ['Users', 'Clubs']
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({ url: `admin/users/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Users', 'PendingUsers']
    }),
    deleteClub: builder.mutation({
      query: (clubId) => ({ url: `admin/clubs/${clubId}`, method: 'DELETE' }),
      invalidatesTags: ['Clubs']
    }),
    applyToClub: builder.mutation({
      query: ({ clubId, ...body }) => ({
        url: `student/clubs/${clubId}/apply`, method: 'POST', body
      }),
      invalidatesTags: ['Clubs', 'Users']
    }),
    getClubApplications: builder.query({
      query: (clubId) => `club-admin/applications/${clubId}`,
      providesTags: ['Applications']
    }),
    updateClubApplication: builder.mutation({
      query: ({ appId, ...body }) => ({
        url: `club-admin/applications/${appId}`, method: 'PATCH', body
      }),
      invalidatesTags: ['Applications', 'Members', 'Users']
    }),
    requestTermination: builder.mutation({
      query: (userId) => ({
        url: 'auth/request-termination', method: 'POST', body: { userId }
      }),
      invalidatesTags: ['Users']
    }),
  })
});

export const {
  useGetEventsQuery,
  useGetClubEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetClubsQuery,
  useCreateClubMutation,
  useGetAdminClubsQuery,
  useGetClubMembersQuery,
  useAddClubMemberMutation,
  useUpdateClubMemberRoleMutation,
  useRemoveClubMemberMutation,
  useGetEventRosterQuery,
  useGetStudentRegistrationsQuery,
  useRegisterForEventMutation,
  usePayForTicketMutation,
  useGetStudentNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSendNotificationMutation,
  useGetClubAdminNotificationsQuery,
  useGetSuperAdminStatsQuery,
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationReadMutation,
  useGetPendingUsersQuery,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useAssignMemberToClubMutation,
  useGetAdminClubMembersQuery,
  useRemoveAdminClubMemberMutation,
  useAssignMentorToClubMutation,
  useRemoveMentorClubMutation,
  useDeleteUserMutation,
  useDeleteClubMutation,
  useApplyToClubMutation,
  useGetClubApplicationsQuery,
  useUpdateClubApplicationMutation,
  useRequestTerminationMutation,
} = axisApi;
