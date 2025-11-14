import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../config/api';
import toast from 'react-hot-toast';

// Async thunks for songs
export const addSong = createAsyncThunk(
  'songs/add',
  async ({ playlistId, songData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/songs/playlist/${playlistId}`, songData);
      toast.success('Song added!');
      return { playlistId, song: response.data };
    } catch (error) {
      toast.error('Failed to add song');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSong = createAsyncThunk(
  'songs/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/songs/${id}`, data);
      toast.success('Song updated!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update song');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSong = createAsyncThunk(
  'songs/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/songs/${id}`);
      toast.success('Song removed!');
      return id;
    } catch (error) {
      toast.error('Failed to remove song');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchSpotify = createAsyncThunk(
  'songs/searchSpotify',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/spotify/search?q=${query}&limit=10`);
      return response.data;
    } catch (error) {
      toast.error('Failed to search Spotify');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const songSlice = createSlice({
  name: 'songs',
  initialState: {
    searchResults: [],
    searching: false,
    loading: false,
    error: null
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add song
      .addCase(addSong.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSong.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update song
      .addCase(updateSong.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSong.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete song
      .addCase(deleteSong.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSong.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Spotify
      .addCase(searchSpotify.pending, (state) => {
        state.searching = true;
        state.error = null;
      })
      .addCase(searchSpotify.fulfilled, (state, action) => {
        state.searching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSpotify.rejected, (state, action) => {
        state.searching = false;
        state.error = action.payload;
      });
  }
});

export const { clearSearchResults, clearError } = songSlice.actions;
export default songSlice.reducer;
