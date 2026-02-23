import sys
import os
import json

import matplotlib
matplotlib.use('Agg')

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QFormLayout, QGroupBox, QLabel, QLineEdit, QSpinBox, QComboBox,
    QPushButton, QCheckBox, QScrollArea, QColorDialog, QFileDialog,
    QStatusBar, QSplitter, QSizePolicy
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QPixmap, QColor

from config import load_fonts, THEMES_DIR, POSTERS_DIR
from themes import get_available_themes, load_theme
from data import get_coordinates, fetch_map_data
from render import render_poster


class ColorPickerButton(QPushButton):
    color_changed = pyqtSignal(str)

    def __init__(self, color="#000000", parent=None):
        super().__init__(parent)
        self.setFixedSize(40, 28)
        self._color = color
        self._update_style()
        self.clicked.connect(self._pick_color)

    def _update_style(self):
        self.setStyleSheet(
            f"background-color: {self._color}; border: 1px solid #888; border-radius: 3px;"
        )

    def _pick_color(self):
        dlg = QColorDialog(QColor(self._color), self)
        if dlg.exec():
            self._color = dlg.selectedColor().name()
            self._update_style()
            self.color_changed.emit(self._color)

    def get_color(self):
        return self._color

    def set_color(self, color):
        self._color = color
        self._update_style()


class ThemeEditorPanel(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # Preset selector
        preset_layout = QHBoxLayout()
        preset_layout.addWidget(QLabel("Preset:"))
        self.preset_combo = QComboBox()
        self.preset_combo.currentTextChanged.connect(self._on_preset_changed)
        preset_layout.addWidget(self.preset_combo, 1)
        layout.addLayout(preset_layout)

        # Theme name / description
        self.name_edit = QLineEdit()
        self.name_edit.setPlaceholderText("Theme name")
        self.desc_edit = QLineEdit()
        self.desc_edit.setPlaceholderText("Description")
        layout.addWidget(QLabel("Name:"))
        layout.addWidget(self.name_edit)
        layout.addWidget(QLabel("Description:"))
        layout.addWidget(self.desc_edit)

        # Color pickers in groups
        self._pickers = {}

        general_keys = [
            ("bg", "Background"),
            ("text", "Text"),
            ("gradient_color", "Gradient"),
            ("water", "Water"),
            ("parks", "Parks"),
        ]
        layout.addWidget(self._make_group("General", general_keys))

        road_keys = [
            ("road_motorway", "Motorway"),
            ("road_primary", "Primary"),
            ("road_secondary", "Secondary"),
            ("road_tertiary", "Tertiary"),
            ("road_residential", "Residential"),
            ("road_default", "Default"),
        ]
        layout.addWidget(self._make_group("Roads", road_keys))

        transit_keys = [
            ("transit", "Transit"),
            ("transit_rail", "Rail"),
            ("transit_subway", "Subway"),
            ("transit_tram", "Tram"),
        ]
        layout.addWidget(self._make_group("Transit", transit_keys))

        layout.addStretch()

        self.refresh_presets()

    def _make_group(self, title, keys):
        group = QGroupBox(title)
        form = QFormLayout(group)
        for key, label in keys:
            btn = ColorPickerButton("#000000")
            self._pickers[key] = btn
            form.addRow(label + ":", btn)
        return group

    def refresh_presets(self):
        self.preset_combo.blockSignals(True)
        current = self.preset_combo.currentText()
        self.preset_combo.clear()
        for name in get_available_themes():
            self.preset_combo.addItem(name)
        if current and self.preset_combo.findText(current) >= 0:
            self.preset_combo.setCurrentText(current)
        self.preset_combo.blockSignals(False)

    def _on_preset_changed(self, name):
        if not name:
            return
        theme = load_theme(name)
        self.load_theme(theme)

    def load_theme(self, theme):
        self.name_edit.setText(theme.get("name", ""))
        self.desc_edit.setText(theme.get("description", ""))
        for key, btn in self._pickers.items():
            btn.set_color(theme.get(key, "#000000"))

    def get_theme(self):
        theme = {
            "name": self.name_edit.text(),
            "description": self.desc_edit.text(),
        }
        for key, btn in self._pickers.items():
            theme[key] = btn.get_color()
        return theme


class PosterWorker(QThread):
    progress = pyqtSignal(str)
    finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, city, country, distance, theme, text_options, output_file):
        super().__init__()
        self.city = city
        self.country = country
        self.distance = distance
        self.theme = theme
        self.text_options = text_options
        self.output_file = output_file

    def run(self):
        try:
            self.progress.emit("Looking up coordinates...")
            coords = get_coordinates(self.city, self.country)

            self.progress.emit("Fetching map data...")
            map_data = fetch_map_data(coords, self.distance)

            self.progress.emit("Rendering poster...")
            fonts = load_fonts()
            render_poster(
                self.city, self.country, coords, self.theme, fonts,
                map_data, self.output_file,
                text_options=self.text_options, dpi=150
            )

            self.finished.emit(self.output_file)
        except Exception as e:
            self.error.emit(str(e))


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Map Poster Generator")
        self.resize(1200, 800)
        self.setMinimumSize(1000, 700)

        self._worker = None
        self._last_output = None

        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QHBoxLayout(central)

        # --- Left panel (scrollable) ---
        left_scroll = QScrollArea()
        left_scroll.setWidgetResizable(True)
        left_scroll.setFixedWidth(360)
        left_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)

        # Theme editor
        self.theme_editor = ThemeEditorPanel()
        left_layout.addWidget(self.theme_editor)

        # Location inputs
        loc_group = QGroupBox("Location")
        loc_form = QFormLayout(loc_group)
        self.city_edit = QLineEdit()
        self.city_edit.setPlaceholderText("e.g. Paris")
        self.country_edit = QLineEdit()
        self.country_edit.setPlaceholderText("e.g. France")
        self.distance_spin = QSpinBox()
        self.distance_spin.setRange(1000, 50000)
        self.distance_spin.setValue(10000)
        self.distance_spin.setSuffix(" m")
        self.distance_spin.setSingleStep(1000)
        loc_form.addRow("City:", self.city_edit)
        loc_form.addRow("Country:", self.country_edit)
        loc_form.addRow("Distance:", self.distance_spin)
        left_layout.addWidget(loc_group)

        # Text overlays
        text_group = QGroupBox("Text Overlays")
        text_layout = QVBoxLayout(text_group)
        self.chk_city = QCheckBox("City Name")
        self.chk_city.setChecked(True)
        self.chk_country = QCheckBox("Country")
        self.chk_country.setChecked(True)
        self.chk_coords = QCheckBox("Coordinates")
        self.chk_coords.setChecked(True)
        self.chk_divider = QCheckBox("Divider Line")
        self.chk_divider.setChecked(True)
        text_layout.addWidget(self.chk_city)
        text_layout.addWidget(self.chk_country)
        text_layout.addWidget(self.chk_coords)
        text_layout.addWidget(self.chk_divider)
        left_layout.addWidget(text_group)

        # Buttons
        btn_layout = QHBoxLayout()
        self.generate_btn = QPushButton("Generate")
        self.generate_btn.clicked.connect(self._on_generate)
        self.save_theme_btn = QPushButton("Save Theme")
        self.save_theme_btn.clicked.connect(self._on_save_theme)
        btn_layout.addWidget(self.generate_btn)
        btn_layout.addWidget(self.save_theme_btn)
        left_layout.addLayout(btn_layout)

        left_layout.addStretch()
        left_scroll.setWidget(left_widget)

        # --- Right panel (preview) ---
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        self.preview_label = QLabel("No preview yet. Enter a city and click Generate.")
        self.preview_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_label.setSizePolicy(
            QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding
        )
        self.preview_label.setStyleSheet("background-color: #2b2b2b; color: #aaa;")
        right_layout.addWidget(self.preview_label)

        # Splitter
        splitter = QSplitter(Qt.Orientation.Horizontal)
        splitter.addWidget(left_scroll)
        splitter.addWidget(right_widget)
        splitter.setStretchFactor(0, 0)
        splitter.setStretchFactor(1, 1)
        main_layout.addWidget(splitter)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")

    def _get_text_options(self):
        return {
            "show_city": self.chk_city.isChecked(),
            "show_country": self.chk_country.isChecked(),
            "show_coordinates": self.chk_coords.isChecked(),
            "show_divider": self.chk_divider.isChecked(),
        }

    def _on_generate(self):
        city = self.city_edit.text().strip()
        country = self.country_edit.text().strip()
        if not city or not country:
            self.status_bar.showMessage("Please enter both city and country.")
            return

        self.generate_btn.setEnabled(False)
        self.status_bar.showMessage("Starting...")

        os.makedirs(POSTERS_DIR, exist_ok=True)
        output_file = os.path.join(
            POSTERS_DIR,
            f"{city.lower().replace(' ', '_')}_preview.png"
        )

        self._worker = PosterWorker(
            city, country, self.distance_spin.value(),
            self.theme_editor.get_theme(),
            self._get_text_options(),
            output_file,
        )
        self._worker.progress.connect(self._on_progress)
        self._worker.finished.connect(self._on_finished)
        self._worker.error.connect(self._on_error)
        self._worker.start()

    def _on_progress(self, msg):
        self.status_bar.showMessage(msg)

    def _on_finished(self, path):
        self._last_output = path
        self.generate_btn.setEnabled(True)
        self.status_bar.showMessage(f"Done! Saved to {path}")
        self._load_preview(path)

    def _on_error(self, msg):
        self.generate_btn.setEnabled(True)
        self.status_bar.showMessage(f"Error: {msg}")

    def _load_preview(self, path):
        pixmap = QPixmap(path)
        if pixmap.isNull():
            self.preview_label.setText("Failed to load preview image.")
            return
        scaled = pixmap.scaled(
            self.preview_label.size(),
            Qt.AspectRatioMode.KeepAspectRatio,
            Qt.TransformationMode.SmoothTransformation,
        )
        self.preview_label.setPixmap(scaled)

    def _on_save_theme(self):
        theme = self.theme_editor.get_theme()
        name = theme.get("name", "").strip()
        if not name:
            self.status_bar.showMessage("Please enter a theme name.")
            return

        os.makedirs(THEMES_DIR, exist_ok=True)
        slug = name.lower().replace(" ", "_")
        path = os.path.join(THEMES_DIR, f"{slug}.json")
        with open(path, "w") as f:
            json.dump(theme, f, indent=2)

        self.theme_editor.refresh_presets()
        self.theme_editor.preset_combo.setCurrentText(slug)
        self.status_bar.showMessage(f"Theme saved to {path}")

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if self._last_output and os.path.exists(self._last_output):
            self._load_preview(self._last_output)


def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
