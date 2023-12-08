import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Recycle from "./pages/Recycle";

function App() {
 return (
  <>
   <div className="Admin">
    <BrowserRouter basename="/specialstarsadmin/">
     <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/posts" element={<Posts />}></Route>
      <Route path="/recycle" element={<Recycle />}></Route>
     </Routes>
    </BrowserRouter>
   </div>
  </>
 );
}

export default App;
