import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../config/api';
import toast from 'react-hot-toast';

// Async thunks
export const fetchPlaylists = createAsyncThunk(
  'playlists/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/playlists');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch playlists');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPlaylistById = createAsyncThunk(      
  'playlists/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/playlists/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch playlist');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlists/create',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/playlists', playlistData);
      toast.success('Playlist created!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create playlist');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePlaylist = createAsyncThunk(
  'playlists/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/playlists/${id}`, data);
      toast.success('Playlist updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update playlist');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePlaylist = createAsyncThunk(
  'playlists/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/playlists/${id}`);
      toast.success('Playlist deleted!');
      return id;
    } catch (error) {
      toast.error('Failed to delete playlist');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generateDescription = createAsyncThunk(
  'playlists/generateDescription',
  async (id, { rejectWithValue }) => {
    try {
      toast.loading('Generating AI description...', { id: 'ai-desc' });
      const response = await api.post(`/ai/playlist/${id}/description`);
      toast.success('AI description generated!', { id: 'ai-desc' });
      return { id, description: response.data.description };
    } catch (error) {
      toast.error('Failed to generate description', { id: 'ai-desc' });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const analyzeMood = createAsyncThunk(
  'playlists/analyzeMood',
  async (id, { rejectWithValue }) => {
    try {
      toast.loading('Analyzing mood...', { id: 'ai-mood' });
      const response = await api.post(`/ai/playlist/${id}/mood`);
      toast.success(`Mood detected: ${response.data.mood}`, { id: 'ai-mood' });
      return { id, mood: response.data.mood };
    } catch (error) {
      toast.error('Failed to analyze mood', { id: 'ai-mood' });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const playlistSlice = createSlice({
  name: 'playlists',
  initialState: {
    items: [],
    currentPlaylist: null,
    loading: false,
    error: null,
    stats: {
      totalPlaylists: 0,
      totalSongs: 0
    }
  },
  reducers: {
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all playlists
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.stats.totalPlaylists = action.payload.length;
        state.stats.totalSongs = action.payload.reduce((sum, p) => sum + (p.songs?.length || 0), 0);
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch playlist by ID
      .addCase(fetchPlaylistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlaylist = action.payload;
      })
      .addCase(fetchPlaylistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create playlist
      .addCase(createPlaylist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.stats.totalPlaylists += 1;
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update playlist
      .addCase(updatePlaylist.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentPlaylist?.id === action.payload.id) {
          state.currentPlaylist = action.payload;
        }
      })
      .addCase(updatePlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete playlist
      .addCase(deletePlaylist.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p.id !== action.payload);
        state.stats.totalPlaylists -= 1;
        if (state.currentPlaylist?.id === action.payload) {
          state.currentPlaylist = null;
        }
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Generate AI description
      .addCase(generateDescription.fulfilled, (state, action) => {
        if (state.currentPlaylist?.id === action.payload.id) {
          state.currentPlaylist.aiDescription = action.payload.description;
        }
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index].aiDescription = action.payload.description;
        }
      })
      
      // Analyze mood
      .addCase(analyzeMood.fulfilled, (state, action) => {
        if (state.currentPlaylist?.id === action.payload.id) {
          state.currentPlaylist.mood = action.payload.mood;
        }
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index].mood = action.payload.mood;
        }
      });
  }
});

export const { clearCurrentPlaylist, clearError } = playlistSlice.actions;
export default playlistSlice.reducer;
