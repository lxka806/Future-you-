import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About"
import Features from "./pages/Features"
import HowWorks from "./pages/HowWorks"
import FAQ from "./pages/FAQ"
import Reviews from "./pages/Reviews"



function App() {
  return ( 
    <>
      <NavBar />
      <main>
        <Home />
        <About />
        <Features />
        <HowWorks />
        <FAQ />
        <Reviews />
        <Footer />
      </main>
    </>
  );
}

export default App;