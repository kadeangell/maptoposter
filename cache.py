import os
import pickle
import shutil

import osmnx as ox

from config import CACHE_DIR

def init_cache():
    """Initialize cache directory and configure OSMnx HTTP response caching."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    ox.settings.use_cache = True
    ox.settings.cache_folder = os.path.join(CACHE_DIR, "http")

def _cache_path(label, point, dist):
    """Build a cache file path from label, coordinates, and distance."""
    lat, lon = point
    return os.path.join(CACHE_DIR, f"{label}_{lat:.4f}_{lon:.4f}_{dist}.pkl")

def load_cache(label, point, dist):
    """Load cached data. Returns (data, hit) tuple."""
    path = _cache_path(label, point, dist)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f), True
    return None, False

def save_cache(data, label, point, dist):
    """Save data to cache."""
    path = _cache_path(label, point, dist)
    with open(path, 'wb') as f:
        pickle.dump(data, f)

def clear_cache():
    """Remove all cached OSM data."""
    if os.path.exists(CACHE_DIR):
        shutil.rmtree(CACHE_DIR)
        print(f"Cache cleared ({CACHE_DIR}/)")
    else:
        print("No cache to clear.")
