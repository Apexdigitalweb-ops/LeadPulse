async function test() {
  const query = `[out:json][timeout:25];
area["ISO3166-2"="BR-SP"]->.s;
(
  node(area.s)["amenity"="dentist"];
);
out 5;`

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
  ]

  for (const ep of endpoints) {
    console.log(`\nTesting endpoint: ${ep}`)
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: "data=" + encodeURIComponent(query)
      })
      console.log("Status:", res.status)
      const text = await res.text()
      console.log("Response preview:", text.slice(0, 200))
    } catch (e) {
      console.log("Error:", e.message)
    }
  }
}

test()

