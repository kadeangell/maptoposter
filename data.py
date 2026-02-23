import time

import osmnx as ox
from geopy.geocoders import Nominatim
from tqdm import tqdm

from cache import init_cache, load_cache, save_cache

def get_coordinates(city, country):
    """
    Fetches coordinates for a given city and country using geopy.
    Includes rate limiting to be respectful to the geocoding service.
    """
    print("Looking up coordinates...")
    geolocator = Nominatim(user_agent="city_map_poster")

    time.sleep(1)

    location = geolocator.geocode(f"{city}, {country}")

    if location:
        print(f"Found: {location.address}")
        print(f"Coordinates: {location.latitude}, {location.longitude}")
        return (location.latitude, location.longitude)
    else:
        raise ValueError(f"Could not find coordinates for {city}, {country}")

def fetch_map_data(point, dist, use_cache=True):
    """
    Fetch all OSM data (streets, water, parks, transit) with optional caching.
    Returns dict with keys: 'streets', 'water', 'parks', 'transit'.
    """
    if use_cache:
        init_cache()

    result = {}

    with tqdm(total=4, desc="Fetching map data", unit="step",
              bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt}') as pbar:
        # 1. Street Network
        if use_cache:
            G, hit = load_cache('streets', point, dist)
        else:
            G, hit = None, False
        if hit:
            pbar.set_description("Loading streets (cached)")
        else:
            pbar.set_description("Downloading street network")
            G = ox.graph_from_point(point, dist=dist, dist_type='bbox', network_type='all')
            if use_cache:
                save_cache(G, 'streets', point, dist)
            time.sleep(0.5)
        pbar.update(1)
        result['streets'] = G

        # 2. Water Features
        if use_cache:
            water, hit = load_cache('water', point, dist)
        else:
            water, hit = None, False
        if hit:
            pbar.set_description("Loading water (cached)")
        else:
            pbar.set_description("Downloading water features")
            try:
                water = ox.features_from_point(point, tags={'natural': 'water', 'waterway': 'riverbank'}, dist=dist)
            except:
                water = None
            if use_cache:
                save_cache(water, 'water', point, dist)
            time.sleep(0.3)
        pbar.update(1)
        result['water'] = water

        # 3. Parks
        if use_cache:
            parks, hit = load_cache('parks', point, dist)
        else:
            parks, hit = None, False
        if hit:
            pbar.set_description("Loading parks (cached)")
        else:
            pbar.set_description("Downloading parks/green spaces")
            try:
                parks = ox.features_from_point(point, tags={'leisure': 'park', 'landuse': 'grass'}, dist=dist)
            except:
                parks = None
            if use_cache:
                save_cache(parks, 'parks', point, dist)
            time.sleep(0.3)
        pbar.update(1)
        result['parks'] = parks

        # 4. Transit Lines
        if use_cache:
            transit, hit = load_cache('transit', point, dist)
        else:
            transit, hit = None, False
        if hit:
            pbar.set_description("Loading transit (cached)")
        else:
            pbar.set_description("Downloading transit lines")
            try:
                transit = ox.features_from_point(
                    point,
                    tags={'railway': ['rail', 'subway', 'tram', 'light_rail', 'monorail']},
                    dist=dist
                )
            except:
                transit = None
            if use_cache:
                save_cache(transit, 'transit', point, dist)
        pbar.update(1)
        result['transit'] = transit

    print("All data loaded!")
    return result
