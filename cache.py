import os
import re
import pickle
import shutil

import osmnx as ox
from shapely.geometry import box

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


def _find_larger_cache(label, point, dist):
    """Find a cached file for the same label/point with distance >= dist."""
    if not os.path.exists(CACHE_DIR):
        return None, None
    lat, lon = point
    prefix = f"{label}_{lat:.4f}_{lon:.4f}_"
    for fname in os.listdir(CACHE_DIR):
        if not fname.startswith(prefix) or not fname.endswith(".pkl"):
            continue
        # Extract the distance from the filename
        m = re.match(re.escape(prefix) + r"(\d+)\.pkl$", fname)
        if not m:
            continue
        cached_dist = int(m.group(1))
        if cached_dist >= dist:
            return os.path.join(CACHE_DIR, fname), cached_dist
    return None, None


def _bbox_from_point(point, dist):
    """Compute a (west, south, east, north) bounding box around point."""
    north, south, east, west = ox.utils_geo.bbox_from_point(point, dist=dist)
    return west, south, east, north


def _crop_graph(G, point, dist):
    """Truncate a street graph to a smaller bounding box."""
    north, south, east, west = ox.utils_geo.bbox_from_point(point, dist=dist)
    return ox.truncate.truncate_graph_bbox(G, north, south, east, west)


def _crop_geodataframe(gdf, point, dist):
    """Clip a GeoDataFrame to a smaller bounding box."""
    if gdf is None:
        return None
    w, s, e, n = _bbox_from_point(point, dist)
    clip_box = box(w, s, e, n)
    clipped = gdf.clip(clip_box)
    if clipped.empty:
        return None
    return clipped


def load_cache(label, point, dist):
    """
    Load cached data. Returns (data, hit) tuple.
    If an exact match isn't found, looks for a larger cached area and crops it.
    """
    # Try exact match first
    path = _cache_path(label, point, dist)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f), True

    # Try to find a larger cached area and crop it
    larger_path, cached_dist = _find_larger_cache(label, point, dist)
    if larger_path is None:
        return None, False

    with open(larger_path, 'rb') as f:
        data = pickle.load(f)

    if data is None:
        return None, True

    if label == 'streets':
        cropped = _crop_graph(data, point, dist)
    else:
        cropped = _crop_geodataframe(data, point, dist)

    # Cache the cropped result for future exact lookups
    save_cache(cropped, label, point, dist)
    return cropped, True


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
