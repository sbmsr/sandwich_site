const html = `
<html>
<head>
  <style>
    body {
      background-color: black;
    }
  </style>
</head>
<body>
  <script>
    function getRandomGif() {
      fetch('/gif')
        .then(response => response.blob())
        .then(blob => {
          let objectURL = URL.createObjectURL(blob);
          let img = new Image();
          img.src = objectURL;
          img.onload = function() {
            document.body.style.backgroundImage = \`url($\{img.src\})\`;
          };
        })
        .catch(error => console.error('Error fetching gifs:', error));
    }

    setInterval(getRandomGif, 30000);
    getRandomGif(); // Call immediately to set initial gif
  </script>
</body>
</html>
`

Deno.serve({
  port: 8000, // Specify a port if needed
}, async (req) => {
  let url = new URL(req.url)
  if (url.pathname === '/gif') {
    const gifs = [];
    for await (const dirEntry of Deno.readDir('./gifs')) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.gif')) {
        gifs.push(dirEntry.name);
      }
    }
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)]
    console.log(randomGif)
    return new Response(Deno.readFileSync(`./gifs/${randomGif}`), {
      headers: {
        'content-type': "image/gif"
      }
    });
  }
  return new Response(html, {
    headers: {
      'content-type': "text/html"
    }
  });
});
