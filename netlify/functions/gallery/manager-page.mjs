export const managerPage = `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#142820">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'">
  <title>Manage Photos | SRDA Associates</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="stylesheet" href="/fonts.css">
  <link rel="stylesheet" href="/style.css">
  <script defer src="/gallery.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="header" id="top">
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="SRDA Associates home">
        <span class="seal" aria-hidden="true">S</span>
        <span class="brand-name">SRDA <span>ASSOCIATES</span></span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/#practice">Practice areas</a>
        <a href="/about">About</a>
        <a href="/#contact">Contact</a>
      </nav>
      <a class="button header-contact" href="tel:+919837005415">Call office</a>
    </div>
  </header>
  <main class="section" id="main">
    <div class="shell">
      <div class="section-heading">
        <h1 class="manager-title">Manage photos</h1>
        <a class="button button-outline" href="/about#gallery">View gallery</a>
      </div>
      <div class="gallery-manager">
        <h2>Upload a photo</h2>
        <p>Use real photos of the office, team, or work. Keep client documents and confidential screens out of view. JPG, PNG, or WebP, up to 4 MB.</p>
        <form id="gallery-form">
          <label>Photo <input id="photo-file" type="file" accept="image/jpeg,image/png,image/webp" required></label>
          <label>Caption <span>(optional)</span> <input id="photo-caption" type="text" maxlength="120" placeholder="Describe what’s in the photo"></label>
          <button class="button button-dark" type="submit">Upload photo</button>
        </form>
      </div>
      <p id="gallery-status" class="gallery-status" role="status"></p>
      <div class="gallery-photos" id="gallery-photos"></div>
    </div>
  </main>
  <footer>
    <div class="shell footer-inner">
      <a class="brand" href="/"><span class="seal" aria-hidden="true">S</span><span class="brand-name">SRDA <span>ASSOCIATES</span></span></a>
      <p>For general information. Please contact the office for matters specific to you.</p>
      <a class="top-link" href="#top">Back to top</a>
    </div>
  </footer>
</body>
</html>
`;
