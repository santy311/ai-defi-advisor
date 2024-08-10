import React from "react";
import { ChakraProvider, CSSReset, extendTheme } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import IntegratedDeFiAdvisor from "./components/IntegratedDeFiAdvisor";
import IDKitVerification from "./components/IDKitVerification";
import SuccessPage from "./components/SuccessPage";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/" element={<IntegratedDeFiAdvisor />} />
          <Route path="/verify" element={<IDKitVerification />} />
          <Route path="/success-page" element={<SuccessPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
