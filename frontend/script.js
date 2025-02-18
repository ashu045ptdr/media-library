fetch("http://localhost:5000/api/media")
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById("mediaList");
    data.media.forEach(media => {
      const li = document.createElement("li");
      li.innerHTML = `<img src="${media.imageUrl}" width="100">`;
      list.appendChild(li);
    });
  });
