import { BrowserRouter as Router } from "react-router-dom"
import Dashboard from "./components/Dashboard"
import { TabProvider } from "./contexts/TabContext"

function App() {

  return (
    <Router>
      <TabProvider>
        <Dashboard />
      </TabProvider>
    </Router>
  )
}

export default App
