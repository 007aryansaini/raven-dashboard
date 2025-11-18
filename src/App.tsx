import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
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
          <Route path="/score" element={<Dashboard />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </TabProvider>
    </Router>
  )
}

export default App
