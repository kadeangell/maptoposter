import osmnx as ox
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
import matplotlib.colors as mcolors
import numpy as np

def create_gradient_fade(ax, color, location='bottom', zorder=10):
    """
    Creates a fade effect at the top or bottom of the map.
    """
    vals = np.linspace(0, 1, 256).reshape(-1, 1)
    gradient = np.hstack((vals, vals))

    rgb = mcolors.to_rgb(color)
    my_colors = np.zeros((256, 4))
    my_colors[:, 0] = rgb[0]
    my_colors[:, 1] = rgb[1]
    my_colors[:, 2] = rgb[2]

    if location == 'bottom':
        my_colors[:, 3] = np.linspace(1, 0, 256)
        extent_y_start = 0
        extent_y_end = 0.25
    else:
        my_colors[:, 3] = np.linspace(0, 1, 256)
        extent_y_start = 0.75
        extent_y_end = 1.0

    custom_cmap = mcolors.ListedColormap(my_colors)

    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    y_range = ylim[1] - ylim[0]

    y_bottom = ylim[0] + y_range * extent_y_start
    y_top = ylim[0] + y_range * extent_y_end

    ax.imshow(gradient, extent=[xlim[0], xlim[1], y_bottom, y_top],
              aspect='auto', cmap=custom_cmap, zorder=zorder, origin='lower')

def get_edge_colors_by_type(G, theme):
    """
    Assigns colors to edges based on road type hierarchy.
    """
    edge_colors = []

    for u, v, data in G.edges(data=True):
        highway = data.get('highway', 'unclassified')

        if isinstance(highway, list):
            highway = highway[0] if highway else 'unclassified'

        if highway in ['motorway', 'motorway_link']:
            color = theme['road_motorway']
        elif highway in ['trunk', 'trunk_link', 'primary', 'primary_link']:
            color = theme['road_primary']
        elif highway in ['secondary', 'secondary_link']:
            color = theme['road_secondary']
        elif highway in ['tertiary', 'tertiary_link']:
            color = theme['road_tertiary']
        elif highway in ['residential', 'living_street', 'unclassified']:
            color = theme['road_residential']
        else:
            color = theme['road_default']

        edge_colors.append(color)

    return edge_colors

def get_edge_widths_by_type(G):
    """
    Assigns line widths to edges based on road type.
    """
    edge_widths = []

    for u, v, data in G.edges(data=True):
        highway = data.get('highway', 'unclassified')

        if isinstance(highway, list):
            highway = highway[0] if highway else 'unclassified'

        if highway in ['motorway', 'motorway_link']:
            width = 1.2
        elif highway in ['trunk', 'trunk_link', 'primary', 'primary_link']:
            width = 1.0
        elif highway in ['secondary', 'secondary_link']:
            width = 0.8
        elif highway in ['tertiary', 'tertiary_link']:
            width = 0.6
        else:
            width = 0.4

        edge_widths.append(width)

    return edge_widths

def plot_transit_lines(ax, transit, theme):
    """
    Plot transit lines (rail, subway, tram, light rail) with theme colors.
    """
    if 'railway' not in transit.columns:
        return

    transit_types = [
        ('rail',       'transit_rail',   2.0),
        ('subway',     'transit_subway', 3.0),
        ('light_rail', 'transit_tram',   2.5),
        ('tram',       'transit_tram',   2.0),
        ('monorail',   'transit_tram',   2.0),
    ]

    default_color = theme.get('transit', '#FF4444')

    for rtype, color_key, width in transit_types:
        mask = transit['railway'] == rtype
        subset = transit[mask]
        if subset.empty:
            continue
        line_mask = subset.geometry.type.isin(['LineString', 'MultiLineString'])
        lines = subset[line_mask]
        if lines.empty:
            continue
        color = theme.get(color_key, default_color)
        lines.plot(ax=ax, color=color, linewidth=width, zorder=5, alpha=0.85)

def render_poster(city, country, point, theme, fonts, map_data, output_file,
                  text_options=None, dpi=300):
    """
    Compose and save the final poster image.
    """
    if text_options is None:
        text_options = {}
    G = map_data['streets']
    water = map_data['water']
    parks = map_data['parks']
    transit = map_data['transit']

    print("Rendering map...")
    fig, ax = plt.subplots(figsize=(16, 16), facecolor=theme['bg'])
    ax.set_facecolor(theme['bg'])
    ax.set_position([0, 0, 1, 1])

    # Layer 1: Polygons
    if water is not None and not water.empty:
        water.plot(ax=ax, facecolor=theme['water'], edgecolor='none', zorder=1)
    if parks is not None and not parks.empty:
        parks.plot(ax=ax, facecolor=theme['parks'], edgecolor='none', zorder=2)

    # Layer 2: Roads
    print("Applying road hierarchy colors...")
    edge_colors = get_edge_colors_by_type(G, theme)
    edge_widths = get_edge_widths_by_type(G)

    ox.plot_graph(
        G, ax=ax, bgcolor=theme['bg'],
        node_size=0,
        edge_color=edge_colors,
        edge_linewidth=edge_widths,
        show=False, close=False
    )

    # Layer 3: Transit Lines
    if transit is not None and not transit.empty:
        print("Plotting transit lines...")
        plot_transit_lines(ax, transit, theme)

    # Layer 4: Gradients
    create_gradient_fade(ax, theme['gradient_color'], location='bottom', zorder=10)
    create_gradient_fade(ax, theme['gradient_color'], location='top', zorder=10)

    # Layer 5: Typography
    if fonts:
        font_main = FontProperties(fname=fonts['bold'], size=60)
        font_sub = FontProperties(fname=fonts['light'], size=22)
        font_coords = FontProperties(fname=fonts['regular'], size=14)
    else:
        font_main = FontProperties(family='monospace', weight='bold', size=60)
        font_sub = FontProperties(family='monospace', weight='normal', size=22)
        font_coords = FontProperties(family='monospace', size=14)

    if text_options.get("show_city", True):
        spaced_city = "  ".join(list(city.upper()))
        ax.text(0.5, 0.14, spaced_city, transform=ax.transAxes,
                color=theme['text'], ha='center', fontproperties=font_main, zorder=11)

    if text_options.get("show_country", True):
        ax.text(0.5, 0.10, country.upper(), transform=ax.transAxes,
                color=theme['text'], ha='center', fontproperties=font_sub, zorder=11)

    if text_options.get("show_coordinates", True):
        lat, lon = point
        coords = f"{lat:.4f}\u00b0 N / {lon:.4f}\u00b0 E" if lat >= 0 else f"{abs(lat):.4f}\u00b0 S / {lon:.4f}\u00b0 E"
        if lon < 0:
            coords = coords.replace("E", "W")
        ax.text(0.5, 0.07, coords, transform=ax.transAxes,
                color=theme['text'], alpha=0.7, ha='center', fontproperties=font_coords, zorder=11)

    if text_options.get("show_divider", True):
        ax.plot([0.4, 0.6], [0.125, 0.125], transform=ax.transAxes,
                color=theme['text'], linewidth=1, zorder=11)

    # Save
    print(f"Saving to {output_file}...")
    plt.savefig(output_file, dpi=dpi, facecolor=theme['bg'])
    plt.close()
    print(f"Done! Poster saved as {output_file}")
