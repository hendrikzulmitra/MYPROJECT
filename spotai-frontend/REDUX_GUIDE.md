# Redux Toolkit Setup - SpotAI

## 📦 Struktur Redux

```
src/store/
├── index.js          # Store configuration
├── playlistSlice.js  # Playlist state & thunks
└── songSlice.js      # Song state & thunks
```

## 🎯 Cara Menggunakan

### 1. Dashboard (Fetch Playlists)
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaylists } from '../../store/playlistSlice';

const { items: playlists, loading, stats } = useSelector((state) => state.playlists);
const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchPlaylists());
}, [dispatch]);
```

### 2. Playlist Detail (Fetch, Update, Delete)
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPlaylistById, 
  updatePlaylist, 
  deletePlaylist,
  generateDescription,
  analyzeMood 
} from '../../store/playlistSlice';

const { currentPlaylist, loading } = useSelector((state) => state.playlists);
const dispatch = useDispatch();

// Fetch playlist
dispatch(fetchPlaylistById(id));

// Update playlist
dispatch(updatePlaylist({ id, data: { title, description, mood } }));

// Delete playlist
dispatch(deletePlaylist(id)).then(() => navigate('/dashboard'));

// AI Features
dispatch(generateDescription(id));
dispatch(analyzeMood(id));
```

### 3. Songs (Add, Update, Delete, Search)
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { 
  addSong, 
  updateSong, 
  deleteSong,
  searchSpotify,
  clearSearchResults 
} from '../../store/songSlice';

const { searchResults, searching } = useSelector((state) => state.songs);
const dispatch = useDispatch();

// Add song
dispatch(addSong({ playlistId, songData }))
  .then(() => dispatch(fetchPlaylistById(playlistId)));

// Update song
dispatch(updateSong({ id, data }))
  .then(() => dispatch(fetchPlaylistById(playlistId)));

// Delete song
dispatch(deleteSong(songId))
  .then(() => dispatch(fetchPlaylistById(playlistId)));

// Search Spotify
dispatch(searchSpotify(query));

// Clear search
dispatch(clearSearchResults());
```

### 4. Create Playlist
```jsx
import { createPlaylist } from '../../store/playlistSlice';

dispatch(createPlaylist({ title, description, mood, coverImage }))
  .then((action) => {
    if (action.type.endsWith('/fulfilled')) {
      navigate(`/playlists/${action.payload.id}`);
    }
  });
```

## 🔄 State Structure

### Playlists State
```js
{
  items: [],              // All playlists
  currentPlaylist: null,  // Currently viewed playlist
  loading: false,
  error: null,
  stats: {
    totalPlaylists: 0,
    totalSongs: 0
  }
}
```

### Songs State
```js
{
  searchResults: [],
  searching: false,
  loading: false,
  error: null
}
```

## ✨ Features

✅ **Automatic toast notifications** (success/error)
✅ **Optimistic stats updates**
✅ **Error handling** with rejectWithValue
✅ **Loading states** for all async operations
✅ **AI features integration** (description, mood)
✅ **Spotify search integration**

## 🚀 Next Steps

1. Update `PlaylistDetail.jsx` to use Redux
2. Update `PlaylistsList.jsx` to use Redux  
3. Update `CreatePlaylist.jsx` to use Redux
4. Remove old state management code
5. Enjoy centralized state! 🎉
