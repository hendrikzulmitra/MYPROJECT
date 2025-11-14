import { configureStore } from '@reduxjs/toolkit';
import playlistReducer from './playlistSlice';
import songReducer from './songSlice';

export const store = configureStore({
  reducer: {
    playlists: playlistReducer,
    songs: songReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['playlists/fetchAll/fulfilled'],
      },
    }),
});

export default store;
