import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import { TabProvider } from "./contexts/TabContext"


function App() {

  return (
    <Router>
      <TabProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/polymarket" element={<Dashboard />} />
          <Route path="/crypto" element={<Dashboard />} />
          <Route path="/points" element={<Dashboard />} />
          <Route path="/benchmark" element={<Dashboard />} />
        </Routes>
      </TabProvider>
    </Router>
  )
}

export default App
