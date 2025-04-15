function fetchFormats() {
  const url = document.getElementById('urlInput').value;

  if (!url) return alert('Please enter a valid YouTube URL');

  fetch(`/api/formats?url=${encodeURIComponent(url)}`)
    .then(response => response.json())
    .then(data => {
      const formatsContainer = document.getElementById('formatsContainer');
      const formatsList = document.getElementById('formatsList');

      formatsList.innerHTML = '';
      formatsList.innerHTML += `<li><strong>Title:</strong> ${data.title}</li>`;
      formatsList.innerHTML += `<li><img src="${data.thumbnail}" width="100"/></li>`;

      data.formats.forEach(format => {
        formatsList.innerHTML += `
          <li onclick="downloadVideo('${url}', '${format.format_id}')">
            <strong>${format.ext.toUpperCase()}</strong> | 
            ${format.resolution} | 
            ${format.filesize ? (format.filesize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown Size'}
          </li>`;
      });

      formatsContainer.style.display = 'block';
    })
    .catch(err => {
      console.error(err);
      alert('Failed to fetch video formats.');
    });
}

function downloadVideo(url, formatId) {
  window.location.href = `/api/download?url=${encodeURIComponent(url)}&format_id=${formatId}`;
}
