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
      <p>Think there should be some? Join us on GitHub!</p>
      {/* <input onChange={(e) => setData(e.target.value)} value={data} /> */}
      <footer>Crafted by @TheBox193</footer>
    </div>
  )
}

export default IndexOptions
