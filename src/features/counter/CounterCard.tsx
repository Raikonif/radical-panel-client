import { useState } from 'react'

export function CounterCard() {
  const [count, setCount] = useState(0)

  return (
    <div className="card">
      <button onClick={() => setCount((value) => value + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
  )
}
