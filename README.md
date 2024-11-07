# Pre-built Tree-Sitter wasm files

This repository contains scripts and build pipelines for building the Tree-Sitter and Tree-Sitter grammar WebAssembly files used by VS Code.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Build steps

> Note: If you're using Windows, you'll need to use WSL. Ensure Docker integration for WSL is enabled before attempting to build. Without this integration, the build process may encounter errors.

First, install all of the dependencies using `npm install`. You will also need to install [emscripten](https://emscripten.org/docs/getting_started/downloads.html). 

Then, build the the wasm files using `npm run build-wasm`, which will do the following:
- Clone the tree-sitter repository
- Build the tree-sitter WebAssembly bindings
- Build the tree-sitter grammars listed in https://github.com/microsoft/vscode-tree-sitter-wasm/blob/alexr00/0.0.1/build/main.ts

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
