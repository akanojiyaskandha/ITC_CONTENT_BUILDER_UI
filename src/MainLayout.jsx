import { ScrollArea } from "./components/ui/scroll-area";
import { Navbar } from "./navigation/navigation-bar";
export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
      <Navbar/>
      <main className="min-h-screen-[calc(100vh-4rem)] w-full p-4">
        {children}
        {/* {children} */}
      </main>
    </div>
  );
};