# 摄影作品集更新方法

1. 将照片放进 `originals/系列名称/`。每个文件夹就是网站上的一个系列，例如 `originals/城市夜色/`。文件名决定照片顺序，建议使用 `01-照片名称.jpg`、`02-照片名称.jpg`。目前支持 JPEG 和 PNG。
2. 在项目根目录运行 `python3 photography/build.py`。脚本会批量生成缩略图、放大图和作品清单；已有且未改动的照片会跳过。
3. 本地预览：在项目根目录运行 `python3 -m http.server 8000`，打开 `http://localhost:8000/photography/`。
4. 检查效果后，提交页面代码、`build.py`、`photos.js`、`images/` 和 `.gitignore`。`photography/originals/` 已被 Git 忽略，该目录中的原图不会随网站发布。当前安全规则禁止我把文件上传到外部地址，因此发布需由你自行操作。

电脑需要 Python 3 和 Pillow（`python3 -m pip install Pillow`）。原图保留在本地，请自行备份。网页图最长边为 2600 像素，并去除 EXIF 等拍摄元数据。网页浏览不能彻底阻止截图或保存展示图。

旧主页的 18 张高分辨率照片和摄影 PDF 已从当前工作目录移除；主页原照片位置现在是缩略图。以后提交这些改动时，旧 PDF 会从新版站点移除，但旧文件仍可能在 Git 历史记录中找到。
