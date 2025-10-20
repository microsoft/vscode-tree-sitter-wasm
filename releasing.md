# How to release

1. Edit the version in `package.json`: 
  - If you're adding a language, update the minor version.
  - If the version of Tree-Sitter itself has changed, update at least the minor version. 
  - Otherwise, update the patch version.

2. Update the `changelog.md`. 

3. Run the [pipeline](https://dev.azure.com/monacotools/Monaco/_build?definitionId=585) with the "Publish tree-sitter-wasm" option.