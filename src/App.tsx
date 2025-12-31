import { Provider } from "@/components/ui/provider";
import Layout from "./Layout";

function App() {
  return (
    <Provider forcedTheme="light">
      <Layout />
    </Provider>
  );
}

export default App;
