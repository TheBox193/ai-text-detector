import { useState } from "react"

function IndexOptions() {
  // const [data, setData] = useState("")

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Settings
      </h1>
      <p>Currently no settings available.</p>
      <p>Think there should be some? <a href="https://github.com/TheBox193/ai-text-detector">Join us on GitHub</a>!</p>
      {/* <input onChange={(e) => setData(e.target.value)} value={data} /> */}
      <footer>Crafted by @TheBox193</footer>
    </div>
  )
}

export default IndexOptions
