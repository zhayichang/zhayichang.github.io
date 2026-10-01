const nav = document.querySelector('#series-nav');
const list = document.querySelector('#series-list');
const dialog = document.querySelector('#lightbox');
const largePhoto = document.querySelector('#large-photo');
const position = document.querySelector('#photo-position');
const title = document.querySelector('#photo-title');
const photos = [];
let current = 0;

function showPhoto(index) {
  current = (index + photos.length) % photos.length;
  const photo = photos[current];
  largePhoto.src = photo.large;
  largePhoto.alt = photo.title;
  position.textContent = `${current + 1} / ${photos.length}`;
  title.textContent = photo.title;
}

window.photoSeries.forEach((series, seriesIndex) => {
  const id = `series-${seriesIndex + 1}`;
  const link = document.createElement('a');
  link.href = `#${id}`;
  link.textContent = series.title;
  nav.append(link);

  const section = document.createElement('section');
  section.className = 'series';
  section.id = id;
  const heading = document.createElement('div');
  heading.className = 'series-heading';
  const name = document.createElement('h2');
  name.textContent = series.title;
  const count = document.createElement('span');
  count.textContent = `${series.photos.length} 张作品`;
  heading.append(name, count);
  const grid = document.createElement('div');
  grid.className = 'photo-grid';

  series.photos.forEach(photo => {
    const index = photos.push(photo) - 1;
    const button = document.createElement('button');
    button.className = 'photo-card';
    button.type = 'button';
    button.setAttribute('aria-label', `放大查看：${photo.title}`);
    const image = document.createElement('img');
    image.src = photo.thumb;
    image.alt = photo.title;
    image.width = photo.width;
    image.height = photo.height;
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => {
      showPhoto(index);
      dialog.showModal();
    });
    grid.append(button);
  });
  section.append(heading, grid);
  list.append(section);
});

document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(current - 1));
document.querySelector('#next-photo').addEventListener('click', () => showPhoto(current + 1));
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPhoto(current - 1);
  if (event.key === 'ArrowRight') showPhoto(current + 1);
});
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
