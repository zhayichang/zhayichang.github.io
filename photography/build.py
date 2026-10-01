from io import BytesIO
from pathlib import Path
from urllib.parse import quote
import json
import re

from PIL import Image, ImageCms, ImageOps


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "originals"
IMAGES = ROOT / "images"
SCRIPT_TIME = Path(__file__).stat().st_mtime
SIZES = {"thumb": (720, 76), "large": (2600, 85)}

if not SOURCE.is_dir():
    raise SystemExit(f"请先创建照片文件夹：{SOURCE}/系列名称/")

series = []
expected = set()
for folder in sorted((p for p in SOURCE.iterdir() if p.is_dir()), key=lambda p: p.name):
    photos = []
    names = set()
    for source in sorted(folder.iterdir(), key=lambda p: [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", p.name)]):
        if source.name.startswith("."):
            continue
        if not source.is_file() or source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            raise SystemExit(f"不支持的照片格式：{source}（请先导出为 JPEG 或 PNG）")
        if source.stem in names:
            raise SystemExit(f"同一系列中有重名照片：{source.stem}")
        names.add(source.stem)

        targets = {kind: IMAGES / folder.name / f"{source.stem}-{kind}.jpg" for kind in SIZES}
        expected.update(targets.values())
        modified = max(source.stat().st_mtime, SCRIPT_TIME)
        if any(not target.exists() or target.stat().st_mtime < modified for target in targets.values()):
            with Image.open(source) as original:
                image = ImageOps.exif_transpose(original)
                if profile := image.info.get("icc_profile"):
                    image = ImageCms.profileToProfile(
                        image,
                        ImageCms.ImageCmsProfile(BytesIO(profile)),
                        ImageCms.createProfile("sRGB"), outputMode="RGB",
                    )
                elif image.mode in {"RGBA", "LA"}:
                    background = Image.new("RGB", image.size, "white")
                    background.paste(image, mask=image.getchannel("A"))
                    image = background
                else:
                    image = image.convert("RGB")
                for kind, (long_edge, quality) in SIZES.items():
                    output = targets[kind]
                    output.parent.mkdir(parents=True, exist_ok=True)
                    resized = image.copy()
                    resized.thumbnail((long_edge, long_edge), Image.Resampling.LANCZOS)
                    resized.save(output, "JPEG", quality=quality, optimize=True, progressive=True)
            print(f"已处理：{folder.name}/{source.name}")

        with Image.open(targets["thumb"]) as thumb:
            width, height = thumb.size
        photos.append({
            "title": source.stem,
            "thumb": f"images/{quote(folder.name)}/{quote(targets['thumb'].name)}",
            "large": f"images/{quote(folder.name)}/{quote(targets['large'].name)}",
            "width": width,
            "height": height,
        })
    if photos:
        series.append({"title": folder.name, "photos": photos})

if not series:
    raise SystemExit(f"没有找到照片。请把 JPEG 或 PNG 放进 {SOURCE}/系列名称/")

extra = {p for p in IMAGES.rglob("*.jpg") if p not in expected} if IMAGES.exists() else set()
if extra:
    raise SystemExit("以下网页图已无对应原图，请检查并手动移走后重新运行：\n" + "\n".join(map(str, sorted(extra))))

(ROOT / "photos.js").write_text(
    "window.photoSeries = " + json.dumps(series, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)
print(f"完成：{len(series)} 个系列，{sum(len(item['photos']) for item in series)} 张照片。")
