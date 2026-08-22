"""Generate platform-specific app icon assets from the approved brand master.

The source image is intentionally reduced to three exact brand colors so that
launcher icons stay crisp and notification/themed variants remain valid.
"""

from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "assets" / "branding"
STORE_DIR = BRAND_DIR / "store"
SOURCE = BRAND_DIR / "app-icon-source.png"

CHARCOAL = (10, 10, 10, 255)
WHITE = (255, 255, 255, 255)
# Existing neutral from the app's dark theme. It distinguishes the checkmark
# without introducing a new semantic warning/error color into the brand.
CHECK_GRAY = (184, 184, 184, 255)
TRANSPARENT = (0, 0, 0, 0)


def normalized_source() -> Image.Image:
    source = Image.open(SOURCE).convert("RGB")
    source.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1024, 1024), CHARCOAL[:3])
    canvas.paste(source, ((1024 - source.width) // 2, (1024 - source.height) // 2))
    return canvas


def masks(source: Image.Image) -> tuple[Image.Image, Image.Image]:
    pixels = source.load()
    white = Image.new("L", source.size, 0)
    coral = Image.new("L", source.size, 0)
    white_pixels = white.load()
    coral_pixels = coral.load()

    for y in range(source.height):
        for x in range(source.width):
            red, green, blue = pixels[x, y]
            is_coral = red > 90 and red > green * 1.25 and red > blue * 1.12
            if is_coral:
                coral_pixels[x, y] = max(0, min(255, int((red - 30) * 1.25)))
            else:
                brightness = (red + green + blue) / 3
                white_pixels[x, y] = max(0, min(255, int((brightness - 15) * 1.18)))

    return white, coral


def layered_mark(white_mask: Image.Image, coral_mask: Image.Image) -> Image.Image:
    mark = Image.new("RGBA", (1024, 1024), TRANSPARENT)
    mark.paste(WHITE, mask=white_mask)
    mark.paste(CHECK_GRAY, mask=coral_mask)
    return mark


def save_png(image: Image.Image, path: Path, size: tuple[int, int] | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    output = image if size is None else image.resize(size, Image.Resampling.LANCZOS)
    output.save(path, "PNG", optimize=True)


def main() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    STORE_DIR.mkdir(parents=True, exist_ok=True)

    source = normalized_source()
    white_mask, coral_mask = masks(source)
    mark = layered_mark(white_mask, coral_mask)

    app_icon = Image.new("RGBA", (1024, 1024), CHARCOAL)
    app_icon.alpha_composite(mark)
    save_png(app_icon.convert("RGB"), BRAND_DIR / "app-icon.png")
    save_png(app_icon.convert("RGB"), STORE_DIR / "apple-app-store-icon-1024.png")
    # Google Play explicitly requires a 32-bit PNG with an alpha channel.
    save_png(app_icon, STORE_DIR / "google-play-icon-512.png", (512, 512))

    save_png(mark, BRAND_DIR / "android-adaptive-foreground.png")
    save_png(mark, BRAND_DIR / "splash-icon.png")

    combined_mask = ImageChops.lighter(white_mask, coral_mask)
    monochrome = Image.new("RGBA", (1024, 1024), TRANSPARENT)
    monochrome.paste(WHITE, mask=combined_mask)
    save_png(monochrome, BRAND_DIR / "android-monochrome.png")
    save_png(monochrome, BRAND_DIR / "notification-icon.png", (96, 96))


if __name__ == "__main__":
    main()
