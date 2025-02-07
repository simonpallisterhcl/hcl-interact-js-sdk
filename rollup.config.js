import commonjs from "@rollup/plugin-commonjs" // For CommonJS compatibility
import resolve from "@rollup/plugin-node-resolve" // For resolving node modules

export default {
  input: "src/interact-spot.js", // Entry point (your wrapper file)
  output: {
    file: "dist/interact-api.min.js", // Output file
    format: "umd", // Universal Module Definition (works in browsers and Node.js)
    name: "InteractAPIWrapper", // Global variable name for the wrapper
    exports: "named", // Explicitly export named functions
  },
  plugins: [
    resolve(), // Resolve node modules
    commonjs(), // Convert CommonJS modules to ES6
  ],
}
