import { BrowserRouter } from "react-router";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppRouter } from "@/app/router";

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
