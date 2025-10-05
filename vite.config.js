const { defineConfig } = require('vite');

// @vitejs/plugin-react is ESM-only; load it dynamically so this CommonJS config can use it.
module.exports = defineConfig(async () => {
  const pluginReact = (await import('@vitejs/plugin-react')).default;
  return {
    plugins: [pluginReact()],
  };
});
