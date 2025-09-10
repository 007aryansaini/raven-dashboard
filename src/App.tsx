import Dashboard from "./components/Dashboard"
import { TabProvider } from "./contexts/TabContext"

function App() {

  return (
    <TabProvider>
      <Dashboard />
    </TabProvider>
  )
}

export default App
