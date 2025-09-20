import { SearchApp } from "@/components/search-app";
import { AppProviders } from "@/components/providers";

export default function Home() {
  return (
    <main>
      <AppProviders>
        <SearchApp />
      </AppProviders>
    </main>
  );
}
