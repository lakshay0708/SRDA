const form = document.querySelector('#gallery-form');
const galleryPath = form ? '/manage-photos/api' : '/api/gallery';
const photoGrid = document.querySelector('#gallery-photos');
const galleryStatus = document.querySelector('#gallery-status');
const maxPhotoSize = 4 * 1024 * 1024;

function showGallery({ photos, canManage }) {
  photoGrid.replaceChildren();
  if (!photos.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'gallery-placeholder';
    placeholder.textContent = 'No photos added yet.';
    photoGrid.append(placeholder);
    return;
  }

  for (const photo of photos) {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    link.href = '/gallery-images/' + encodeURIComponent(photo.id);
    const image = new Image();
    image.src = link.href;
    image.alt = photo.caption || 'SRDA Associates office photo';
    image.loading = 'lazy';
    link.append(image);

    figure.append(link);
    if (photo.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = photo.caption;
      figure.append(caption);
    }

    if (form && canManage) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove photo';
      remove.className = 'gallery-remove';
      if (photo.caption) remove.setAttribute('aria-label', 'Remove photo: ' + photo.caption);
      remove.addEventListener('click', () => removePhoto(photo, remove));
      figure.append(remove);
    }
    photoGrid.append(figure);
  }
}

async function requestGallery(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The gallery could not be updated.');
  return result;
}

async function refreshGallery() {
  showGallery(await requestGallery(galleryPath));
}

async function removePhoto(photo, button) {
  const photoLabel = photo.caption ? '“' + photo.caption + '”' : 'this photo';
  if (!window.confirm('Remove ' + photoLabel + ' from the gallery?')) return;
  button.disabled = true;
  try {
    await requestGallery(galleryPath + '/' + encodeURIComponent(photo.id), { method: 'DELETE' });
    await refreshGallery();
    galleryStatus.textContent = 'Photo removed.';
    form.querySelector('#photo-file').focus();
  } catch (error) {
    galleryStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = form.querySelector('#photo-file').files[0];
  const caption = form.querySelector('#photo-caption').value.trim();
  if (!file) {
    galleryStatus.textContent = 'Choose a photo to upload.';
    return;
  }
  if (file.size > maxPhotoSize) {
    galleryStatus.textContent = 'Choose a photo up to 4 MB.';
    return;
  }

  const button = form.querySelector('button');
  button.disabled = true;
  galleryStatus.textContent = 'Uploading photo…';
  try {
    await requestGallery(galleryPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Photo-Caption': encodeURIComponent(caption),
      },
      body: file,
    });
    form.reset();
    await refreshGallery();
    galleryStatus.textContent = 'Photo added to the gallery.';
  } catch (error) {
    galleryStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

refreshGallery().catch(() => {
  galleryStatus.textContent = 'The photo gallery could not be loaded. Refresh the page to try again.';
});
