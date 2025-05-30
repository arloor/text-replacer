import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from 'vite-plugin-devtools-json';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [devtoolsJson({uuid:"2552fe39-678a-4505-95f0-719c2d830132"}),tailwindcss(), reactRouter(), tsconfigPaths()],
});
